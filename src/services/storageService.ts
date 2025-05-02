import AsyncStorage from "@react-native-async-storage/async-storage";
import { addNewRestaurant, saveLinkedUsersDB, saveProfileInfoDB } from "./databaseManager";

export const saveRestaurantDetails = async (data:any) => {
    await AsyncStorage.setItem('url', data.restaurantUrl);
    await AsyncStorage.setItem('restaurantName', data.restaurantName);
    const res = await AsyncStorage.getItem('user')
    const user = JSON.parse(res as string)
    const {email, name} = user;
    await addNewRestaurant( email, name, data.restaurantName, data.restaurantUrl)
}

// Save profile information
export const saveProfileInfo = async (info : ProfileInformation) => {
    await AsyncStorage.setItem('profileInfo', JSON.stringify(info));
    await saveProfileInfoDB(info);
};

// Fetch profile information
export const fetchProfileInfo = async () => {
    const data = await AsyncStorage.getItem('profileInfo');
    return data ? JSON.parse(data) : null;
};

// Save menu
export const saveMenu = async (menu: Menu) => {
    await AsyncStorage.setItem('menu', JSON.stringify(menu));
};

// Fetch menu
export const fetchMenu = async () => {
    const data = await AsyncStorage.getItem('menu');
    return data ? JSON.parse(data) : null;
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
  await saveLinkedUsersDB(linkedUsers);
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
