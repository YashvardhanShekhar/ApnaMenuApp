import React, {PropsWithChildren, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {View, StyleSheet} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {createNavigationContainerRef} from '@react-navigation/native';
import LinkedUsersScreen from '../screens/LinkedUsersScreen';


import MenuScreen from '../screens/MenuScreen';
import AddDish from '../screens/AddDish';
import ProfileScreen from '../screens/ProfileScreen';
import EditInfo from '../screens/EditInfoScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
export const navigation = createNavigationContainerRef();

export type userProps = PropsWithChildren<{
  name: string;
  email: string;
}>;


const ProfileNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Profile"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen
        name="EditInfo"
        component={EditInfo as React.ComponentType}
      />
      <Stack.Screen
        name="LinkedUsers"
        component={LinkedUsersScreen as React.ComponentType}
      />
    </Stack.Navigator>
  );
};


const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
});


export default ProfileNavigator;