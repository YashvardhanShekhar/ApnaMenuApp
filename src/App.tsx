import React, {PropsWithChildren, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {View, StyleSheet} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {createNavigationContainerRef} from '@react-navigation/native';


import SignUpScreen from './screens/SignUp';
import LoginScreen from './screens/LoginScreen';
import MenuScreen from './screens/MenuScreen';
import ProfileScreen from './screens/ProfileScreen';
import AddDish from './screens/AddDish';
import SettingsScreen from './screens/SettingsScreen';
import {ThemeProvider} from './screens/ThemeContext';
import SplashScreen from './screens/SplashScreen';
import { prepareApp } from './components/prepareApp';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
export const navigation = createNavigationContainerRef();

export type userProps = PropsWithChildren<{
  name: string;
  email: string;
}>;

const Home = () => {
  return (
    <Stack.Navigator
      initialRouteName="Menu"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="Menu" component={MenuScreen} />
      <Stack.Screen name="AddDish" component={AddDish as React.ComponentType} />
    </Stack.Navigator>
  );
};

const Tabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 15,
          left: 20,
          right: 20,
          backgroundColor: '#ffffff',
          borderRadius: 25,
          height: 55,
          paddingBottom: 8,
          paddingTop: 8,
          marginHorizontal: 10,
          ...styles.shadow,
        },
      }}>
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({focused}) => (
            <View style={{alignItems: 'center', justifyContent: 'center'}}>
              <Ionicons
                name="home-outline"
                size={24}
                color={focused ? '#000000' : '#a1a1a1'}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <View style={{alignItems: 'center', justifyContent: 'center'}}>
              <Ionicons
                name="person-outline"
                size={24}
                color={focused ? '#000000' : '#a1a1a1'}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <View style={{alignItems: 'center', justifyContent: 'center'}}>
              <Ionicons
                name="settings-outline"
                size={24}
                color={focused ? '#000000' : '#a1a1a1'}
              />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const App = () => {
  useEffect(() => {
    prepareApp();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NavigationContainer ref={navigation}>
          <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen name="Home" component={Tabs} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen
              name="SignUp"
              component={SignUpScreen as React.ComponentType}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
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

export default App;
