import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SplashScreen = ({navigation}) => {
  // const navigation = useNavigation()

  const fetchData = async () => {
    const userRes = await AsyncStorage.getItem('user');
    const url = await AsyncStorage.getItem('url')
    if(!userRes || !url){
      navigate.replace('Login');
    }
    
    const menuRes = await AsyncStorage.getItem('menu');
    const menu = JSON.parse(menuRes)
    if(menu){
      navigate.replace('Home');
    }
    
  }

  useEffect(() => {
    setTimeout(() => {
      navigation.replace('Home');
    }, 3000); 
  }, [navigation]);

  return (
    <View style={styles.splashContainer}>
      <Text style={styles.logoText}>My App</Text>
      <ActivityIndicator size="large" color="#ffffff" />
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#4a90e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
