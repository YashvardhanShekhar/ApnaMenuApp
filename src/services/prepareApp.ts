import AsyncStorage from '@react-native-async-storage/async-storage';
import {fetchAllData} from './databaseManager';
import BootSplash from 'react-native-bootsplash';
import {navigation} from '../App';
import { saveLinkedUser } from './storageService';

export const prepareApp = async () => {
  try {
    const userRes = await AsyncStorage.getItem('user');
    const url = await AsyncStorage.getItem('url');
    if (!userRes || !url) {
      navigation.current?.reset({
        index: 0,
        routes: [{name: 'Login'}],
      });
    }

    const menuRes = await AsyncStorage.getItem('menu');
    // if (menuRes) {
    //   navigation.current?.reset({
    //     index: 0,
    //     routes: [{name: 'Home'}],
    //   });
    // } else {
      const data: any = await fetchAllData(url as string);
      await AsyncStorage.setItem('menu', JSON.stringify(data.menu));
      await AsyncStorage.setItem('info', JSON.stringify(data.info));
      console.log(data);
      console.log('00000000000000000000000000000000000000000000')
      await saveLinkedUser(data.linkedUser);

      navigation.current?.reset({
        index: 0,
        routes: [{name: 'Home'}],
      });
    // }
  } finally {
    BootSplash.hide({fade: true});
  }
};
