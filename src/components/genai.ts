import {createUserContent, GoogleGenAI, Type} from '@google/genai';
import Snackbar from 'react-native-snackbar';
import { navigate } from '../services/navigationService';

// Configure the client
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

export const parseMenu = async image => {
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

    using this JSON schema
    - Return
      Dish = { name: string, price: number }
      Category = { [dish_name: string]: Dish }
      Menu = { [category: string]: Category }
      Return: { menu: Menu }
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
  
  const data = response.text;
  const extractJsonString = data.match(/```(?:json)?\n([\s\S]*?)```/)?.[1];
  const menuData = JSON.parse(extractJsonString);
  if (menuData.length === 0) {
    Snackbar.show({
      text: 'No menu data found',
      duration: Snackbar.LENGTH_LONG,
    });
    return;
  }
  console.log( menuData);
  navigate('MenuEditScreen', {menuData});
};
