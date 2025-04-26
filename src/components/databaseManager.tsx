import { View, Text } from 'react-native'
import React from 'react'
import firestore from '@react-native-firebase/firestore';
import Snackbar from 'react-native-snackbar';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const userExists = async (email:string) => {
    const allUser = await firestore().collection('users').get();
    allUser.forEach(user => {
        if (user.data().email === email) {
            return true;
        }
    })
    return false;
}


export const addNewDish = async (category: string, name: string, price: number) => {
  const url = await AsyncStorage.getItem('url');
  const val = 'menu.'+category+'.'+ name

  await firestore()
    .collection('restaurants')
    .doc(url)
    .update({
        [val]: { name: name, price: price, status: true },
    })
    .then(() => {
      Snackbar.show({
        text: 'Dish added!',
        duration: Snackbar.LENGTH_SHORT,
      });
    })
    .catch(error => {
      Snackbar.show({
        text: error.message,
        duration: Snackbar.LENGTH_SHORT,
      });
    });
};


