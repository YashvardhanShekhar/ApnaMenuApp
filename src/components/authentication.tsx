import React, {useState} from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {statusCodes,GoogleSignin} from '@react-native-google-signin/google-signin';
import auth, { firebase } from '@react-native-firebase/auth';
import {GOOGLE_WEB_CLIENT_ID} from '@env';
import firestore from '@react-native-firebase/firestore';

GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  scopes: ['profile', 'email'],
});

export const handleLogOut = async (navigation: any) => {
  try {
    await GoogleSignin.signOut();
    await AsyncStorage.clear();
    navigation.replace('Login');
  } catch (error) {
    Alert.alert('Error', 'Failed to sign out.');
    console.error(error);
  }
};

export const handleSignIn = async (navigation: any) => {

  try {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();
    const {idToken} = await GoogleSignin.getTokens();
    const credential = auth.GoogleAuthProvider.credential(idToken);
    await auth().signInWithCredential(credential);
    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    await firebase
    navigation.replace('Home');
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
      Alert.alert('An unexpected error occurred.');
    }
  }
};

