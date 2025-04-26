import { View, Text } from 'react-native'
import React from 'react'
import firestore from '@react-native-firebase/firestore';
import Snackbar from 'react-native-snackbar';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const userExists = async (email) => {
    const allUser = await firestore().collection('users').get();
    allUser.forEach(user => {
        if (user.data().email === email) {
            return true;
        }
    })
    return false;
}

export const addUser = async (email) => {
    const user = await firestore().collection('users').add(email);
}
export const addRedtaurant = async (name) => {
    await firestore().collection('user').doc(email).add(name);
    await firestore().collection('restaurants').add(name);
}

export const AddCategory = async (category) => {
    await firestore().collection('restaurants').doc('firstRestaurant').collection('menu').add(category);
}

export const addNewDish = async (category, name, price) => {
    const url = await AsyncStorage.getItem('url');
    await firestore()
       .collection('restaurants')
       .doc(url)
       .collection('menu')
       .doc(category)
       .update({ 
          [name]: {
              name: name,
              price: price,
              available: true
          }
       })
       .then(() => {
            Snackbar.show({
                text: 'Dish added!',  
                duration: Snackbar.LENGTH_SHORT,
            });
       })
       .catch((error) => {
            Snackbar.show({
                text: error.message,
                duration: Snackbar.LENGTH_SHORT,
            });
       });
}

// export const addDish({category, name, price }) {
//     const 

// }
