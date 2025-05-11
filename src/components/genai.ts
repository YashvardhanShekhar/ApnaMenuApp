import {createUserContent, GoogleGenAI, Type} from '@google/genai';
import Snackbar from 'react-native-snackbar';
import {navigate} from '../services/navigationService';
import {addMenu, fetchMenu, fetchProfileInfo, fetchUser} from '../services/storageService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { botAddMenuItem, botDeleteMenuItem, botUpdateMenuItem } from '../services/botManager';

// Configure the client
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

export const parseMenu = async (image: string) => {
  const promptText = `
    You are a restaurant menu parser.

    - Extract only **dish names** and **numeric prices** from the image.
    - **Do not include any currency symbols** (₹ or Rs). Only include numeric prices (e.g., 120, not ₹120).
    - If the menu contains **multiple types of items**, group them into Indian food categories like:
      - Starters, Main Course, Biryani, Roti, Desserts, and Drinks.
    - For dishes like “Tandoori Roti” or “Rumali Roti,” group them under **Roti**.
    - If categories are missing or unclear, **intelligently infer them**.
    - If the menu is **specialized** (e.g., only drinks or only pizzas), **categorization is optional**.
    - For each category, separate dishes into:
      - "Veg" and "Non-Veg" based on name (e.g., "Paneer Biryani" → Veg, "Chicken Biryani" → Non-Veg).
    - Only include items that clearly have a **price**
    - set status to true for all items

    - her is one example of a menu in json format for your reference:
    {
            menu: {
              "Coffee": {
                Espresso: {
                  name: 'Espresso',
                  price: 12.99,
                  status: true,
                },
                'Mocha Latte': {
                  name: 'Mocha Latte',
                  price: 22,
                  status: true,
                },
              },
              "Snacks": {
                'French Fries': {
                  name: 'French Fries',
                  price: 12.99,
                  status: true,
                },
              },
            },
          };
    - The menu should be in JSON format, and the keys should be the **dish names**.
    - If you do not find any relevant information return an empty JSON object.

    using this JSON schema:
    json
    {
      "menu": {
        "category": {
          "dish_name": {
            "name": "string",
            "price": "number",
            "status": true,
          }
        }
      }
    }
    `;

  // Send request with function declarations
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: image,
        },
      },
      {text: promptText},
    ],
  });

  const data: any = response.text;
  console.log(data);
  if (data === '{}') {
    return {};
  }
  const extractJsonString = data.match(/```(?:json)?\n([\s\S]*?)```/)?.[1];
  const menuData = JSON.parse(extractJsonString);
  return menuData;
};




export const chat = async (message: string, allPrevMsg: Message[]) => {
  const addMenuItem = {
    name: 'addMenuItem',
    description:
      'Adds a new dish to the restaurant menu under a specified category.', // KEY CHANGE
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: {
          type: Type.STRING,
          description: 'Name of the dish.',
        },
        price: {
          type: Type.NUMBER,
          description: 'Price in local currency.',
        },
        category: {
          type: Type.STRING,
          description: 'Category name (e.g., Drinks, Main Course, Snacks).', // KEY CHANGE
        },
      },
      required: ['name', 'price', 'category'],
    },
  };

  const deleteMenuItem = {
    name: 'deleteMenuItem',
    description:
      'Deletes a dish from the restaurant menu under a specified category.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: {
          type: Type.STRING,
          description: 'Name of the dish.',
        },
        category: {
          type: Type.STRING,
          description: 'Category name (e.g., Drinks, Main Course, Snacks).', // Add category
        },
      },
      required: ['name', 'category'],
    },
  };
  const updateMenuItem = {
    name: 'updateMenuItem',
    description:
      'Updates dish price or availability under a specified category.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: {
          type: Type.STRING,
          description: 'Name of the dish.',
        },
        availability: {
          type: 'boolean',
          description: 'Availability status (true/false).',
        },
        price: {
          type: Type.NUMBER,
          description: 'Updated price.',
        },
        category: {
          type: Type.STRING,
          description: 'Category name (e.g., Drinks, Main Course, Snacks).', //Add Category
        },
      },
      required: ['name', 'category'], // Require Category
    },
  };

  console.log('Message:', ...allPrevMsg);
  const prevMsg = allPrevMsg.map((msg) => ({
    role: msg.role,
    parts: [{text: msg.content}],
  }))

  const menu = await fetchMenu();
  const profile = await fetchProfileInfo();
  const {name} = await fetchUser();
  console.log(name)

  const promptText = `
  You are ApnaMenuBot, a smart and friendly restaurant assistant.
  
  Your job is to:
  - Chat naturally, be creative and helpfully with the user user's name ${name}  .
  - Answer questions about the menu (e.g. price, availability, category).
  - Respond to user commands like **add**, **update**, or **delete** menu items.
  - Show the full menu when asked.
  - Handle unrelated questions (like "what's the weather?") with a casual reply or use the appropriate tool if available.
  - If the message is unclear, ask polite follow-up questions.
  - **always give some response in text** even if the function is called its most important.
  
  You can call functions when appropriate:
  - Use **addMenuItem** when the user asks to add a dish (mention dish name, category, and price).
  - Use **updateMenuItem** when they want to change price or availability.
  - Use **deleteMenuItem** if they want to remove a dish.
  
  **Examples:**
  - User: Add Cheese Pizza in Snacks for ₹99  
    → (Call addMenuItem function)
    → Sure! Adding Cheese Pizza to Snacks for ₹99...  
  
  - User: Make Coffee unavailable  
    → (Call updateMenuItem function)
    → Got it. Marking Coffee as unavailable...  
  
  - User: Delete Dosa from Snacks  
    → (Call deleteMenuItem function)
    → Dosa has been removed from the Snacks category.  
  
  - User: What's the price of French Fries?  
    → French Fries are ₹15 and currently unavailable.
  
  - User: Hi  
    → Hello! How can I assist you with the menu today? or any other casual reply.

  **Restaurant Information**
  ${JSON.stringify(profile)}
  
  **Current Menu:**
  ${JSON.stringify(menu)}
  
  `;
  


  const config = {
    tools: [{
        functionDeclarations: [
          addMenuItem,
          deleteMenuItem,
          updateMenuItem,
        ],
    }],
  };

  const contents = [
    {
      role: 'user',
      parts: [{text: promptText}],
    },
    ...prevMsg,
    {
      role: 'user',
      parts: [{text: message}],
    },
  ];

  console.log('Contents:', contents);

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: contents,
    config: config,
  });

  console.log('Response:', response);

  if (response.functionCalls && response.functionCalls.length > 0) {
    const functionCall = response.functionCalls[0];
    console.log('Function Call:', functionCall);
    const functionName = functionCall.name;
    const args:any = functionCall.args;

    let result;
    let menuUpdateMessage = ''; // Capture message to update user

    switch (functionName) {
      case 'addMenuItem':
        result = await botAddMenuItem(args);
        switch (result) {
          case false:
            menuUpdateMessage = `Failed to add ${args.name} to ${args.category}.`;
            break;
          case true:
            menuUpdateMessage = `Added ${args.name} to ${args.category}.`;
            break;
          case 'exists':
            menuUpdateMessage = `${args.name} already exists in ${args.category}.`;
            break;
        }
        break;
      case 'deleteMenuItem':
        result = await botDeleteMenuItem(args);
        switch (result) {
          case true:
            menuUpdateMessage = `Deleted ${args.name} from ${args.category}.`;
            break;
          case false:
            menuUpdateMessage = `Failed to delete ${args.name} from ${args.category}.`;
            break;
        }
        break;
      case 'updateMenuItem':
        result = await botUpdateMenuItem(args);
        switch (result) {
          case true:
            menuUpdateMessage = `updated ${args.name} with price ${
              args.price
            } and is ${args.availability ? 'available' : 'sold out'} in ${
              args.category
            }.`;
            break;
          case false:
            menuUpdateMessage = `Failed to update ${args.name} in ${args.category}.`;
            break;
        }
        break;
    }
    return response.text + menuUpdateMessage;
  }
  return response.text;
};
