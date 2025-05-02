import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Tabs from './TabNavigator';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUp';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Home" component={Tabs} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen
        name="SignUp"
        component={SignUpScreen as React.ComponentType}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
