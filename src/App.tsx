import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {View, StyleSheet} from 'react-native';
import {createNavigationContainerRef} from '@react-navigation/native';
import {prepareApp} from './services/prepareApp';
import AppNavigator from './navigation/AppNavigator';
import { navigationRef } from './services/navigationService';

const App = () => {
  useEffect(() => {
    prepareApp();
  }, []);

  return (
    <SafeAreaProvider>
        <NavigationContainer ref={navigationRef}>
          <AppNavigator />
        </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
