import {View, Text} from 'react-native';
import React from 'react';
import firestore, {
  arrayRemove,
  arrayUnion,
} from '@react-native-firebase/firestore';
import Snackbar from 'react-native-snackbar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {fetchUrl, fetchUser} from './storageService';

export const addNewDishDB = async (
  category: string,
  name: string,
  price: number,
) => {
  try {
    const status = await dishExists(category, name);
    if (status) {
      throw new Error('Dish already exists');
      return 'exists';
    }
    const url = await AsyncStorage.getItem('url');
    const dishData = {
      name: name,
      price: price,
      status: true,
    };
    if (!url) {
      throw new Error('URL not found in Storage');
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
        return true;
      });
  } catch (error: any) {
    Snackbar.show({
      text: error.message,
      duration: Snackbar.LENGTH_SHORT,
    });
    return false;
  }
};

export const deleteDishDB = async (category: string, name: string) => {
  try {
    const url = await AsyncStorage.getItem('url');
    const path = 'menu.' + category + '.' + name;
    console.log(path);
    await firestore()
      .collection('restaurants')
      .doc(url as string)
      .update({
        [path]: firestore.FieldValue.delete(), // Deleting the nested field
      });

    const res = await firestore()
      .collection('restaurants')
      .doc(url as string)
      .get();
    const data = res.data();
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
            text: `${category} along with ${name} has been deleted`,
            duration: Snackbar.LENGTH_SHORT,
            action: {
              text: 'OK',
              textColor: '#0F766E',
            },
          });
        });
    } else {
      Snackbar.show({
        text: name + ' deleted successfully',
        duration: Snackbar.LENGTH_SHORT,
        action: {
          text: 'OK',
          textColor: '#0F766E',
        },
      });
    }
  } catch (error: any) {
    Snackbar.show({
      text: error.message,
      duration: Snackbar.LENGTH_SHORT,
    });
    return false;
  }
  return true;
};

export const setAvailability = async (
  category: string,
  dishName: string,
  status: boolean,
) => {
  try {
    const url = await AsyncStorage.getItem('url');
    await firestore()
      .collection('restaurants')
      .doc(url as string)
      .set(
        {
          menu: {
            [category]: {
              [dishName]: {
                status: status,
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
};

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

export const addNewRestaurantDB = async (
  email: string,
  name: string,
  restaurantUrl: string,
  info: ProfileInformation,
) => {
  try {
    const isExists = await restaurantUrlExists(restaurantUrl);
    if (isExists) {
      throw new Error('URL already exists');
    }
    await addNewUser(email, restaurantUrl);
    await firestore()
      .collection('restaurants')
      .doc(restaurantUrl as string)
      .set(
        {
          linkedUsers: {
            [email]: {email: email, name: name},
          },
          info: info,
        },
        {merge: true},
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

export const addNewUser = async (email: string, restaurantUrl: string) => {
  await firestore()
    .collection('users')
    .doc(email as string)
    .set({
      url: restaurantUrl,
    });
};

export const deleteUsers = async (data: LinkedUsers) => {
  try {
    Object.keys(data).forEach(async email => {
      await firestore().collection('users').doc(email).delete();
    });
    Snackbar.show({
      text: 'selected users were deleted',
      duration: Snackbar.LENGTH_SHORT,
    });
  } catch (error: any) {
    Snackbar.show({
      text: error.message,
      duration: Snackbar.LENGTH_SHORT,
    });
  }
};

export const fetchAllData = async (url: string) => {
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
};

export const saveProfileInfoDB = async (info: ProfileInformation) => {
  try {
    const url = await AsyncStorage.getItem('url');
    if (!url) {
      throw new Error('URL not found in Storage');
    }

    await firestore()
      .collection('restaurants')
      .doc(url as string)
      .set(
        {
          info: info,
        },
        {merge: true},
      )
      .then(() => {
        Snackbar.show({
          text: 'Profile details updated',
          duration: Snackbar.LENGTH_SHORT,
          action: {
            text: 'OK',
            textColor: '#0F766E',
          },
        });
      });
    return true;
  } catch (error: any) {
    Snackbar.show({
      text: error.message,
      duration: Snackbar.LENGTH_SHORT,
    });
    return false;
  }
};

export const emailExists = async (email: string): Promise<boolean> => {
  const res = await firestore()
    .collection('users')
    .doc(email as string)
    .get();

  if (res.exists) {
    return true;
  } else {
    return false;
  }
};

export const saveLinkedUsersDB = async (data: LinkedUsers) => {
  try {
    const restaurantUrl = await AsyncStorage.getItem('url');
    if (!restaurantUrl) {
      throw new Error('URL not found in Storage');
    }
    Object.keys(data).forEach(async email => {
      await addNewUser(email, restaurantUrl);
    });

    await firestore()
      .collection('restaurants')
      .doc(restaurantUrl as string)
      .update({
        linkedUsers: data,
      })
      .then(() => {
        Snackbar.show({
          text: 'Users updated',
          duration: Snackbar.DISMISS_EVENT_CONSECUTIVE,
          action: {
            text: 'OK',
            textColor: '#0F766E',
          },
        });
      });
  } catch (error: any) {
    Snackbar.show({
      text: error.message,
      duration: Snackbar.DISMISS_EVENT_SWIPE,
    });
  }
};

export const deleteAccountPermanently = async (email: string, url: string) => {
  try {
    await firestore().collection('users').doc(email).delete();
    await firestore().collection('restaurants').doc(url).delete();
    Snackbar.show({
      text: url + ' has been deleted Permanently',
      duration: Snackbar.LENGTH_LONG,
    });
  } catch (error) {
    console.log(error);
    Snackbar.show({
      text: 'some error has occurred try again',
      duration: Snackbar.LENGTH_LONG,
    });
  }
};

export const deleteUsersInUsers = async (arr: string[]) => {
  const url = await fetchUrl();
  try {
    arr.map(async email => {
      const res = await firestore().collection('users').doc(email).get();
      const resUrl = res.data()?.url;
      if (url === resUrl) {
        await firestore().collection('users').doc(email).delete();
      } else {
        Snackbar.show({
          text: email + ' has linked to different restaurant',
          duration: Snackbar.LENGTH_LONG,
        });
      }
    });
  } catch (error) {
    console.log(error);
    Snackbar.show({
      text: 'some error has occurred try again',
      duration: Snackbar.LENGTH_LONG,
    });
  }
};

export const addMenuDB = async (menu: Menu) => {
  try {
    const url = await AsyncStorage.getItem('url');
    if (!url) {
      throw new Error('URL not found in Storage');
    }

    await firestore()
      .collection('restaurants')
      .doc(url as string)
      .set(
        {
          menu: menu,
        },
        {merge: true},
      )
      .then(() => {
        Snackbar.show({
          text: 'menu updated successfully',
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

export const saveMessagesDB = async (
  deleteStatus:boolean,
  oldMsg1: Message,
  oldMsg2: Message,
  newMsg1: Message,
  newMsg2: Message,
) => {
  try {
    const user = await fetchUser();
    const email = user.email;
    if (!email) {
      throw new Error('email not found in Storage');
    }
    if(deleteStatus){
      await firestore()
        .collection('users')
        .doc(email)
        .set(
          {
            messages: arrayRemove(oldMsg1, oldMsg2),
          },
          {merge: true},
        );
    }

    await firestore()
      .collection('users')
      .doc(email)
      .set(
        {
          messages: arrayUnion(newMsg1, newMsg2),
        },
        {merge: true},
      );

    return true;
  } catch (error) {
    Snackbar.show({
      text: 'some error has occurred while saving messages.',
      duration: Snackbar.LENGTH_SHORT,
    });
  }
};

export const fetchMessagesDB = async () => {
  try {
    const user = await fetchUser();
    const email = user.email;
    if (!email) {
      throw new Error('email not found in Storage');
    }
    const res = await firestore().collection('users').doc(email).get();
    const data: any = res.data();
    return data.messages;
  } catch (error) {
    Snackbar.show({
      text: 'some error has occurred while fetching messages.',
      duration: Snackbar.LENGTH_SHORT,
    });
    return [];
  }
};
