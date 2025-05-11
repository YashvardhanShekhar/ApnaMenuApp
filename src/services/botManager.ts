import firestore from '@react-native-firebase/firestore';
import Snackbar from 'react-native-snackbar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {addNewDish, fetchUrl, saveProfileInfo} from './storageService';
import { addNewDishDB, deleteDish, deleteDishDB, dishExists, saveProfileInfoDB } from './databaseManager';

export const botUpdateMenuItem = async args => {
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
          menu: {
            [args.category]: {
              [args.name]: {
                name: [args.name],
                price: [args.price],
                status: [args.availability],
              },
            },
          },
        },
        {merge: true},
      )
      .then(() => {
        return true;
      });
  } catch (error: any) {
    console.log(error.message);
  }
  return false;
};

export const botDeleteMenuItem = async args => {
    // await deleteDish(args.category, args.name);
  return await deleteDishDB(args.category, args.name);
};

export const botAddMenuItem = async args => {
  const status = await dishExists(args.category, args.name);
  if (status) {
    return 'exists';
  }
  await addNewDish(args.category, args.name, args.price);
  return await addNewDishDB(args.category, args.name, args.price);
};

export const updateProfileInformation = async (info) => {
    const res = await saveProfileInfoDB(info)
    res && await saveProfileInfo(info);
    return res ? true : false;
};
