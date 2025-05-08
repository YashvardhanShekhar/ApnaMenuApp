import { navigation } from './../navigation/HomeNavigator';
import React, {useState} from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  statusCodes,
  GoogleSignin,
} from '@react-native-google-signin/google-signin';
import auth, {firebase} from '@react-native-firebase/auth';
import {GOOGLE_WEB_CLIENT_ID} from '@env';
import firestore from '@react-native-firebase/firestore';
import RNExitApp from 'react-native-exit-app';
import Snackbar from 'react-native-snackbar';
import {clearStorage, saveUrl, saveUser, syncData} from './storageService';
import {restaurantUrlExists} from './databaseManager';
import * as NavigationService from './navigationService';


GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  scopes: ['profile', 'email'],
});

export const handleLogOut = async () => {
  try {
    await GoogleSignin.signOut();
    await AsyncStorage.clear();
    NavigationService.reset('Login');
  } catch (error) {
    Snackbar.show({
      text: 'Failed to logout. Please try again',
      backgroundColor: '#dc3545',
      duration: Snackbar.LENGTH_SHORT,
    });
    console.error(error);
  }
};

export const handleSignIn = async () => {
  
  const setUpData = async (url: string) => {
    console.log('URL : ' + url);
    await saveUrl(url);
    await syncData();
    NavigationService.replace('Home');
  };

  try {
    await GoogleSignin.hasPlayServices();
    const response: any = await GoogleSignin.signIn();
    const {idToken} = await GoogleSignin.getTokens();
    const credential = auth.GoogleAuthProvider.credential(idToken);
    await auth().signInWithCredential(credential);

    await saveUser(response.data.user);
    const email = response.data.user.email;
    const name = response.data.user.name;
    const userDoc = await firestore().collection('users').doc(email).get();
    const userData: any = userDoc.data();
    const isExist = userDoc.exists
      ? await restaurantUrlExists(userData.url)
      : null;

    if (isExist) {
      console.log('User exists, navigating to Home...');
      await setUpData(userData.url);
    } else {
      console.log('User does not exist, creating new user...');
      NavigationService.replace('SignUp', {email, name});
    }
  } catch (error: Error) {
    if ((error).code === statusCodes.SIGN_IN_CANCELLED) {
      Alert.alert('Sign-In Cancelled');
    } else if ((error).code === statusCodes.IN_PROGRESS) {
      Alert.alert('Sign-In In Progress');
    } else if (
      (error).code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE
    ) {
      Alert.alert('Google Play Services not available');
    } else {
      console.error(error);
      Alert.alert(error.message);
    }
  }
};
