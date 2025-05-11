import AsyncStorage from '@react-native-async-storage/async-storage';
import {fetchAllData} from './databaseManager';
import BootSplash from 'react-native-bootsplash';
import {clearStorage} from './storageService';
import * as NavigationService from './navigationService';
import { setupModel } from '../components/genai';

export const prepareApp = async () => {
  try {
    const userRes = await AsyncStorage.getItem('user');
    const url = await AsyncStorage.getItem('url');
    if (!userRes || !url) {
      await clearStorage();
      NavigationService.reset('Login');
    } else {
      NavigationService.reset('Home');
    }
  } finally {
    BootSplash.hide({fade: true});
  }
};
