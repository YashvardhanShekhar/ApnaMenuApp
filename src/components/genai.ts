import {createUserContent, GoogleGenAI, Type} from '@google/genai';
import Snackbar from 'react-native-snackbar';
import {navigate} from '../services/navigationService';
import {
  addMenu,
  fetchMenu,
  fetchMessages,
  fetchProfileInfo,
  fetchUser,
} from '../services/storageService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  botAddMenuItem,
  botDeleteMenuItem,
  botUpdateMenuItem,
  botUpdateProfileInfo,
} from '../services/botManager';
import {checkInternet} from './checkInternet';

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

export const setupModel = async () => {
  const addMenuItem = {
    name: 'addMenuItem',
    description:
      'Adds new dish or multiple dishes to the restaurant menu under specified categories.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        items: {
          type: Type.ARRAY,
          items: {
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
                description:
                  'Category name (e.g., Drinks, Main Course, Snacks).',
              },
              description: {
                type: Type.STRING,
                description: 'A short description of the dish',
              },
              availability: {
                type: Type.BOOLEAN,
                description:
                  'Indicates if the dish is currently available.  Defaults to true if not provided.',
              },
            },
            required: ['name', 'price', 'category'],
          },
        },
      },
      required: ['items'],
    },
  };

  const deleteMenuItem = {
    name: 'deleteMenuItem',
    description:
      'Deletes one or multiple dishes from the restaurant menu under specified categories.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        items: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: {
                type: Type.STRING,
                description: 'Name of the dish to delete.',
              },
              category: {
                type: Type.STRING,
                description:
                  'Category name (e.g., Drinks, Main Course, Snacks).',
              },
            },
            required: ['name', 'category'],
          },
        },
      },
      required: ['items'],
    },
  };

  const updateMenuItem = {
    name: 'updateMenuItem',
    description:
      'Updates one or many dishes in the restaurant menu under specified categories.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        items: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: {
                type: Type.STRING,
                description: 'Name of the dish to update.',
              },
              category: {
                type: Type.STRING,
                description:
                  'Category name (e.g., Drinks, Main Course, Snacks).',
              },
              availability: {
                type: Type.BOOLEAN,
                description: 'Availability status (true/false).',
              },
              price: {
                type: Type.NUMBER,
                description: 'Updated price.',
              },
            },
            required: ['name', 'category'],
          },
        },
      },
      required: ['items'],
    },
  };

  const updateProfileInfo = {
    name: 'updateProfileInfo',
    description:
      'Updates or sets user restaurant profile information such as name, phone number, address or description.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: {
          type: Type.STRING,
          description:
            'Updated name of the user if not given set the previous one.',
        },
        phoneNumber: {
          type: Type.STRING,
          description:
            'Updated phone number of the user if not given set the previous one and must contain 10 digits if not ask user to give complete information.',
        },
        address: {
          type: Type.STRING,
          description:
            'Updated address of the user if not given set the previous one.',
        },
        description: {
          type: Type.STRING,
          description:
            'Personal description or bio of the user if not given set the previous one.',
        },
      },
    },
  };

  const allPrevMsg = await fetchMessages();

  const prevMsg = allPrevMsg
    .filter((msg: Message) => msg.content)
    .map((msg: Message) => ({
      role: msg.role,
      parts: [{text: msg.content}],
    }));
  const lastTenMessages = prevMsg.slice(-10);
  console.log('Last 10 Messages:', lastTenMessages);

  const menu = await fetchMenu();
  const profile = await fetchProfileInfo();
  const {name} = await fetchUser();

  const instruction = `
  You are ApnaMenuBot, a smart and friendly restaurant assistant.
  
  Your job is to:
  - always give some response in text even if the function is called its most important.
  - Chat naturally, be creative and helpfully with the user, user's name ${name}.
  - Answer questions about the menu (e.g. price, availability, category).
  - Respond to user commands like **add**, **update**, or **delete** menu items.
  - Provide and change information about the restaurant ( name, address, phone number or description).
  - Show the full menu when asked.
  - Handle unrelated questions (like "what's the weather?") with a casual reply or use the appropriate tool if available.
  - If the message is unclear, ask polite follow-up questions.
  
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
    systemInstruction: instruction,
    tools: [
      {
        functionDeclarations: [
          addMenuItem,
          deleteMenuItem,
          updateMenuItem,
          updateProfileInfo,
        ],
      },
    ],
  };
  try {
    const chat = ai.chats.create({
      model: 'gemini-2.0-flash',
      history: [
        {
          role: 'user',
          parts: [{text: 'hi'}],
        },
        ...lastTenMessages,
      ],
      config: config,
    });

    return chat;
  } catch (error: any) {
    console.error('Error setting up chat model:', error.message);
  }
};

export const chatBot = async (
  msg: string,
  isMsg: boolean,
  base64Audio: string,
) => {
  const chat = await setupModel();
  if (!chat) {
    console.error('Failed to initialize setup model');
    return null;
  }

  try {
    console.log('message is going to send');
    const response = isMsg
      ? await chat.sendMessage({
          message: msg,
        })
      : await chat.sendMessage({
          message: {
            inlineData: {
              mimeType: 'audio/mp4',
              data: base64Audio,
            },
          },
        });

    console.log('Response:', response);

    let menuUpdateMessage = '';
    if (response.functionCalls && response.functionCalls.length > 0) {
      const functionCall = response.functionCalls[0];
      console.log('Function Call:', functionCall);
      const functionName = functionCall.name;
      const args: any = functionCall.args;

      let result;

      switch (functionName) {
        case 'addMenuItem':
          menuUpdateMessage = await botAddMenuItem(args);
          break;
        case 'deleteMenuItem':
          menuUpdateMessage = await botDeleteMenuItem(args);
          break;
        case 'updateMenuItem':
          console.log('Update Menu Item:', args);
          menuUpdateMessage = await botUpdateMenuItem(args);
          break;
        case 'updateProfileInfo':
          console.log('Update Profile Info:', args);
          result = await botUpdateProfileInfo(args);
          switch (result) {
            case true:
              menuUpdateMessage = `Profile updated successfully with ${
                args.phoneNumber ? `phone "${args.phoneNumber}"` : ''
              }${args.address ? `, address "${args.address}"` : ''}${
                args.description ? `, description: "${args.description}"` : ''
              }`;
              break;
            case false:
              menuUpdateMessage = `Failed to update profile information.`;
              break;
          }
          break;
      }
      console.log(response.text + ' ' + response.text === undefined);
      return response.text === undefined ? menuUpdateMessage : response.text;
    } else {
      return response.text;
    }
  } catch (error: any) {
    if (error.code === 429) {
      console.error('Quota limit reached:', error.message);
      Snackbar.show({
        text: 'Rate limit exceeded. Please try again later.',
        duration: Snackbar.LENGTH_SHORT,
      });
      return null;
    }
    if (error.message === 'Network request failed') {
      Snackbar.show({
        text: 'it seems your internet connection is slow',
        duration: Snackbar.LENGTH_SHORT,
      });
      console.warn('Network error: Please check your internet connection.');
    }
    console.error(error);
    Snackbar.show({
      text: 'Something went wrong try again',
      duration: Snackbar.LENGTH_SHORT,
    });
  }
};
