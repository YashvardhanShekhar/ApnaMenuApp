import AsyncStorage from '@react-native-async-storage/async-storage';
import {fetchAllData} from './databaseManager';
import BootSplash from 'react-native-bootsplash';
import Snackbar from 'react-native-snackbar';
import {navigation} from '../App'

export const prepareApp = async () => {
  try {
    const userRes = await AsyncStorage.getItem('user');
    const url = await AsyncStorage.getItem('url');
    if (!userRes || !url) {
      navigation.current?.reset({
        index: 0,
        routes: [{name: 'Login'}],
      });
      console.log('inside Login');
    }
    
    const menuRes = await AsyncStorage.getItem('menu');
    if (menuRes) {
      navigation.current?.reset({
        index: 0,
        routes: [{name: 'Home'}],
      });
      console.log('inside menu bf fetch');
    } else {
      const data = await fetchAllData(url);
      await AsyncStorage.setItem('menu', JSON.stringify(data.menu));
      navigation.current?.reset({
        index: 0,
        routes: [{name: 'Home'}],
      });
      console.log('inside menu after fetch');
    }
  }catch(error){
    Snackbar.show({
      text: "prepareApp "+error.message,
      duration: Snackbar.LENGTH_SHORT,
    });
  }finally {
    BootSplash.hide({fade: true});
  }
};
