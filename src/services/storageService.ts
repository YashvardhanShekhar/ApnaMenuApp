import AsyncStorage from '@react-native-async-storage/async-storage';
import {fetchAllData} from './databaseManager';
import Snackbar from 'react-native-snackbar';

export const saveRestaurantDetails = async (data: any) => {
  await AsyncStorage.setItem('url', data.restaurantUrl);
  await AsyncStorage.setItem('restaurantName', data.restaurantName);
  const res = await AsyncStorage.getItem('user');
  const user = JSON.parse(res as string);
  const {email, name} = user;
};

export const addNewDish = async (category:string, dishName:string, price:number) => {
  try {
    const menuData = await fetchMenu();
    if (menuData) {
      const updatedMenu = {
        ...menuData,
        [category]: {
          ...menuData[category],
          [dishName]: {
            name: dishName,
            price: price,
            status: true,
          },
        },
      };
      await saveMenu(updatedMenu);
    } else {
      const newMenu:Menu = {
        [category]: {
          [dishName]: {
            name: dishName,
            price: price,
            status: true,
          },
        },
      };
      await saveMenu(newMenu);
    }
  } catch (error) {
    Snackbar.show({
      text: 'Failed to add new dish in Storage',
      duration: Snackbar.LENGTH_SHORT,
    });
  }
};

// Save profile information
export const saveProfileInfo = async (info: ProfileInformation) => {
  await AsyncStorage.setItem('profileInfo', JSON.stringify(info));
};

// Fetch profile information
export const fetchProfileInfo = async () => {
  const data = await AsyncStorage.getItem('profileInfo');
  return data ? JSON.parse(data) : null;
};

// Save menu
export const saveMenu = async (menu: Menu) => {
  if (menu) {
    await AsyncStorage.setItem('menu', JSON.stringify(menu));
  }
};

// Fetch menu
export const fetchMenu = async () => {
  const data = await AsyncStorage.getItem('menu');
  return data ? JSON.parse(data) : {};
};

// Save user information
export const saveUser = async (user: User) => {
  await AsyncStorage.setItem('user', JSON.stringify(user));
};

// Fetch user information
export const fetchUser = async () => {
  const data = await AsyncStorage.getItem('user');
  return data ? JSON.parse(data) : null;
};

// Save linked user information
export const saveLinkedUsers = async (linkedUsers: LinkedUsers) => {
  await AsyncStorage.setItem('linkedUsers', JSON.stringify(linkedUsers));
};

// Fetch linked user information
export const fetchLinkedUsers = async (): Promise<User | null> => {
  const data = await AsyncStorage.getItem('linkedUsers');
  return data ? JSON.parse(data) : null;
};

// Save URL
export const saveUrl = async (url: string) => {
  await AsyncStorage.setItem('url', url);
};

// Fetch URL
export const fetchUrl = async () => {
  return await AsyncStorage.getItem('url');
};

// Clear all AsyncStorage data
export const clearStorage = async () => {
  await AsyncStorage.clear();
};

export const syncData = async () => {
  const url = await AsyncStorage.getItem('url');
  const data: any = await fetchAllData(url as any);
  console.log(data);
  await saveMenu(data.menu);
  await saveLinkedUsers(data.linkedUsers);
  await saveProfileInfo(data.info);
};

export const saveStats = async (
  totalItems:number,
  availableItems:number,
  soldOutItems:number,
) => {
  const stats = {
    totalItems: totalItems,
    availableItems: availableItems,
    soldOutItems: soldOutItems,
  };
  await AsyncStorage.setItem( 'stats',JSON.stringify(stats));
};

export const fetchStats = async () => {
  const res = await AsyncStorage.getItem('stats');
  if(res){
    return JSON.parse(res);
  }else{
    return {}
  }
}

export const addMenu = async (menu:Menu) => {
  const existingMenu = await fetchMenu();
  const updatedMenu = {...existingMenu};
  Object.entries(menu).forEach(([category, dishes]) => {
    if (updatedMenu[category]) {
      // If category exists, merge the dishes
      updatedMenu[category] = {
        ...updatedMenu[category],
        ...dishes,
      };
    } else {
      // If category doesn't exist, add it
      updatedMenu[category] = {...dishes};
    }
  });

  await saveMenu(updatedMenu);
}