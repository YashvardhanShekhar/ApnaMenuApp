import React, {useState} from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {statusCodes,GoogleSignin} from '@react-native-google-signin/google-signin';
import auth, { firebase } from '@react-native-firebase/auth';
import {GOOGLE_WEB_CLIENT_ID} from '@env';
import firestore from '@react-native-firebase/firestore';
import RNExitApp from 'react-native-exit-app';

GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  scopes: ['profile', 'email'],
});

export const handleLogOut = async (navigation: any) => {
  try {
    await GoogleSignin.signOut();
    await AsyncStorage.clear();
    RNExitApp.exitApp();
  } catch (error) {
    Alert.alert('Error', 'Failed to sign out.');
    console.error(error);
  }
};

export const handleSignIn = async (navigation: any) => {

  const setUpData = async (url: string) => {
    
    console.log('URL : ',url);
    await AsyncStorage.setItem('url', url);
    
    const dataRes = await firestore().collection('restaurants').doc(url).get();
    const data:any = dataRes.data();
    console.log(data)
    if(data?.menu){
      await AsyncStorage.setItem('menu', JSON.stringify(data.menu));
    }
    navigation.replace('Home');
  }

  try {
    await AsyncStorage.clear();
    await GoogleSignin.hasPlayServices();
    const response:any = await GoogleSignin.signIn();
    const {idToken} = await GoogleSignin.getTokens();
    const credential = auth.GoogleAuthProvider.credential(idToken);
    await auth().signInWithCredential(credential);
    
    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    const email = response.data.user.email;
    const name = response.data.user.name;
    const userDoc = await firestore().collection('users').doc(email).get();
    const userData:any = userDoc.data()

    if (userDoc.exists && userData.url ) {
      console.log('User exists, navigating to Home...');
      await setUpData(userData.url)
    }else{
      console.log('User does not exist, creating new user...');
      navigation.replace('SignUp',{email, name});
    }

  } catch (error) {
    if ((error as any).code === statusCodes.SIGN_IN_CANCELLED) {
      Alert.alert('Sign-In Cancelled');
    } else if ((error as any).code === statusCodes.IN_PROGRESS) {
      Alert.alert('Sign-In In Progress');
    } else if (
      (error as any).code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE
    ) {
      Alert.alert('Google Play Services not available');
    } else {
      console.error(error);
      Alert.alert(error.message);
    }
  }
};