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
    const data:Object = dataRes.data();
    console.log(data)
    if(data.menu){
      await AsyncStorage.setItem('menu', JSON.stringify(data.menu));
    }
    navigation.replace('Home');
  }

  try {
    await AsyncStorage.clear();
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();
    const {idToken} = await GoogleSignin.getTokens();
    const credential = auth.GoogleAuthProvider.credential(idToken);
    await auth().signInWithCredential(credential);
    
    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    const email = response.data.user.email;
    const userDoc = await firestore().collection('users').doc(email).get();
    const userData = userDoc.data()

    if (userDoc.exists && userData.url ) {
      console.log('User exists, navigating to Home...');
      await setUpData(userData.url)
    }else{
      console.log('User does not exist, creating new user...');
      navigation.replace('SignUp',{email});
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

// 1:0 1:1 1:2 1:3 1:4 1:5 1:6 1:7 2:8 3:9 3:10 3:11 3:12 3:13 4:14 4:15 4:16 4:17 4:18 5:19 5:20 6:21 7:22 7:23 7:24 8:25 8:26 8:27 8:28 8:29 8:30 8:31 8:32 9:33 9:34 9:35 9:36 10:37 11:38 12:39 12:40 12:41 12:42 12:43 13:44 13:45 13:46 13:47 13:48 13:49 13:50 13:51 13:52 13:53 13:54 13:55 13:56 14:57 
// 0 2 56
// 1 8 106
// 2 8 156
// 3 8 206
// 4 8 256
// 5 8 306
// 6 8 356
// 7 8 406
// 8 8 456
// 9 9 505
// 10 14 549
// 11 14 593
// 12 14 637
// 13 14 681
// 14 14 725
// 15 19 764
// 16 19 803
// 17 19 842
// 18 19 881
// 19 19 920
// 20 21 957
// 21 21 994
// 22 22 1030
// 23 25 1063
// 24 25 1096
// 25 25 1129
// 26 33 1154
// 27 33 1179
// 28 33 1204
// 29 33 1229
// 30 33 1254
// 31 33 1279
// 32 33 1304
// 33 33 1329
// 34 37 1350
// 35 37 1371
// 36 37 1392
// 37 37 1413
// 38 38 1433
// 39 39 1452
// 40 44 1466
// 41 44 1480
// 42 44 1494
// 43 44 1508
// 44 44 1522
// 45 57 1523
// 46 57 1524
// 47 57 1525
// 48 57 1526
// 49 57 1527
// 50 57 1528
// 51 57 1529
// 52 57 1530
// 53 57 1531
// 54 57 1532
// 55 57 1533
// 56 57 1534
// 57 57 1535

// 0 58
// 8 108
// 8 158
// 8 208
// 8 258
// 8 308
// 8 358
// 8 408
// 8 458
// 9 507
// 14 551
// 14 595
// 14 639
// 14 683
// 14 727
// 19 766
// 19 805
// 19 844
// 19 883
// 19 922
// 21 959
// 21 996
// 22 1032
// 25 1065
// 25 1098
// 25 1131
// 33 1156
// 33 1181
// 33 1206
// 33 1231
// 33 1256
// 33 1281
// 33 1306
// 33 1331
// 37 1352
// 37 1373
// 37 1394
// 37 1415
// 38 1435
// 39 1454
// 44 1468
// 44 1482
// 44 1496
// 44 1510
// 44 1524
// 57 1525
// 57 1526
// 57 1527
// 57 1528
// 57 1529
// 57 1530
// 57 1531
// 57 1532
// 57 1533
// 57 1534
// 57 1535
// 57 1536
// 57 1537