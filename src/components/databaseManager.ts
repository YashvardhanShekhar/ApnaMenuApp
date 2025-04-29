import {View, Text} from 'react-native';
import React from 'react';
import firestore from '@react-native-firebase/firestore';
import Snackbar from 'react-native-snackbar';
import AsyncStorage from '@react-native-async-storage/async-storage';


export const addNewDish = async (
  category: string,
  name: string,
  price: number,
) => {
  try {
    const status = await dishExists(category,name);
    if(status){
      throw new Error('Dish already exists');
    }
    const url = await AsyncStorage.getItem('url');
    const dishData = {
      name: name,
      price: price,
      status: true,
    };
    if(!url){
      throw new Error("URL not found in Storage")
    }

    await firestore()
      .collection('restaurants')
      .doc(url as string)
      .set(
        {
          menu: {
            [category]: {
              [name]: dishData,
            },
          },
        },
        {merge: true},
      )
      .then(() => {
        Snackbar.show({
          text: name + ' added successfully',
          duration: Snackbar.LENGTH_SHORT,
          action: {
            text: 'OK',
            textColor: '#0F766E',
          },
        });
      });
  } catch (error:any) {
    Snackbar.show({
      text: error.message,
      duration: Snackbar.LENGTH_SHORT,
    });
  }
};

export const deleteDish = async (category: string, name: string) => {
  const url = await AsyncStorage.getItem('url');
  const path = 'menu.' + category + '.' + name;
  console.log(path);
  await firestore()
    .collection('restaurants')
    .doc(url as string)
    .update({
      [path]: firestore.FieldValue.delete(), // Deleting the nested field
    })
    .then(() => {
      Snackbar.show({
        text: name + ' deleted successfully',
        duration: Snackbar.LENGTH_SHORT,
        action: {
          text: 'OK',
          textColor: '#0F766E',
        },
      });
    })
    .catch(error => {
      Snackbar.show({
        text: error.message,
        duration: Snackbar.LENGTH_SHORT,
      });
    });
  
  const res = await firestore()
    .collection('restaurants')
    .doc(url as string).get()
  const data = res.data()
  const size = Object.keys(data?.menu?.[category] || {}).length;
  if (size === 0) {
    await firestore()
      .collection('restaurants')
      .doc(url as string)
      .update({
        [`menu.${category}`]: firestore.FieldValue.delete(),
      })
      .then(() => {
        Snackbar.show({
          text: category + ' was empty and has been deleted',
          duration: Snackbar.LENGTH_SHORT,
          action: {
            text: 'OK',
            textColor: '#0F766E',
          },
        });
      })
      .catch(error => {
        Snackbar.show({
          text: error.message,
          duration: Snackbar.LENGTH_SHORT,
        });
      });
  }
};

export const setAvailability = async (category:string,dishName:string,status:boolean)=>{
  try {
    const url = await AsyncStorage.getItem('url');
    const path = `menu.${category}.${dishName}.status`
    await firestore()
      .collection('restaurants')
      .doc(url as string)
      .set(
        {
          menu: {
            [category]: {
              [dishName]: {
                status:status
              },
            },
          },
        },
        {merge: true},
      )
      .then(() => {
        Snackbar.show({
          text: status
            ? dishName + ' is now available'
            : dishName + ' is now sold out',
          duration: Snackbar.LENGTH_SHORT,
          action: {
            text: 'OK',
            textColor: '#0F766E',
          },
        });
      });
  } catch (error: any) {
    Snackbar.show({
      text: error.message,
      duration: Snackbar.LENGTH_SHORT,
    });
  }
}

export const dishExists = async (
  category: string,
  name: string,
): Promise<boolean> => {
  const url = await AsyncStorage.getItem('url');
  const restaurantDoc = await firestore()
    .collection('restaurants')
    .doc(url as string)
    .get();

  if (restaurantDoc.exists) {
    const menu = restaurantDoc.data()?.menu;
    return menu?.[category]?.[name] !== undefined;
  }
  return false;
};

export const categoryExists = async (category: string): Promise<boolean> => {
  const url = await AsyncStorage.getItem('url');
  const restaurantDoc = await firestore()
    .collection('restaurants')
    .doc(url as string)
    .get();

  if (restaurantDoc.exists) {
    const menu = restaurantDoc.data()?.menu;
    return menu?.[category] !== undefined;
  }
  return false;
};

export const restaurantUrlExists = async (url: string): Promise<boolean> => {
  
  const restaurantDoc = await firestore()
    .collection('restaurants')
    .doc(url as string)
    .get();

  if (restaurantDoc.exists) {
    return true;
  }
  return false;
};

export const addNewRestaurant = async (
  email: string,
  restaurantName: string,
  restaurantUrl: string,
) => {
  try {
    const isExists = await restaurantUrlExists(restaurantUrl);
    if(isExists){
      throw new Error('URL already exists');
    }
    await addNewUser(email, restaurantUrl)
    await firestore()
      .collection('restaurants')
      .doc(restaurantUrl as string)
      .set({
        name: restaurantName,
        userLinked:{
          email:email,
        }
      },{merge: true},
      )
      .then(() => {
        Snackbar.show({
          text: `Restaurant added successfully`,
          duration: Snackbar.LENGTH_SHORT,
          action: {
            text: 'OK',
            textColor: '#0F766E',
          },
        });
      });
  } catch (error: any) {
    Snackbar.show({
      text: error.message,
      duration: Snackbar.LENGTH_SHORT,
    });
  }
};

export const addNewUser = async(email:string,restaurantUrl:string)=>{
  await firestore()
    .collection('users')
    .doc(email as string)
    .set({
      url: restaurantUrl,
    })
}

export const fetchAllData = async(url:string) => {
  try {
    const restaurantDoc = await firestore()
      .collection('restaurants')
      .doc(url)
      .get();

    if (restaurantDoc.exists) {
      return restaurantDoc.data();
    }
    throw new Error('Restaurant not found');
  } catch (error: any) {
    Snackbar.show({
      text: error.message,
      duration: Snackbar.LENGTH_SHORT,
    });
    return null;
  }
}