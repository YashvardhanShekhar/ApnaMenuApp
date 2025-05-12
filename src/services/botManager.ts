import firestore from '@react-native-firebase/firestore';
import Snackbar from 'react-native-snackbar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {deleteDish, addNewDish, fetchUrl, saveProfileInfo} from './storageService';
import {
  addNewDishDB,
  deleteDishDB,
  dishExists,
  saveProfileInfoDB,
} from './databaseManager';

export const botUpdateDishDB = async (category:string,args:any) => {
  try {
    const url = await AsyncStorage.getItem('url');
    if (!url) {
      throw new Error('URL not found in Storage');
    }

    await firestore()
      .collection('restaurants')
      .doc(url as string)
      .set(
        {
          menu: {
            [category]: {
              [args.name]: args
            },
          },
        },
        {merge: true},
      )
      .then(() => {
        Snackbar.show({
          text: `${args.name} with ${args.price}rs updated successfully`,
          duration: Snackbar.LENGTH_SHORT,
        });
        return true;
      });
  } catch (error: any) {
    console.log(error.message);
    return false;
  }
};

export const botUpdateMenuItem = async (args: any) => {
  try {
    const url = await AsyncStorage.getItem('url');
    if (!url) {
      throw new Error('URL not found in Storage');
    }
      let msg = '';
      args.items.map(async (item: any) => {
          const category = item.category;
          delete item.category;
          const res = await botUpdateDishDB(category,item);
          if(res){
            msg += `${item.name} updated successfully.\n`
          }else{
            msg += `unable to update ${item.name}.\n`
          }
      });
      return msg;
  } catch (error: any) {
    console.error(error.message)
    return `some error has occurred.`
  }
};

export const botDeleteMenuItem = async args => {
  let msg = '';
  args.items.map( async(item)=>{
    const res = await deleteDishDB(item.category, item.name);
    await deleteDish(item.category, item.name);
    if(res){
      msg += `${item.name} has been deleted.\n`
    }else{
      msg += `failed to delete ${item.name}.\n`
    }
  })
  return msg;
};

export const botAddMenuItem = async res => {
  let msg = '';
  res.items.map( async (args)=>{
    const status = await dishExists(args.category, args.name);
    if(!status){
      await addNewDish(args.category, args.name, args.price);
      await addNewDishDB(args.category, args.name, args.price);
      msg += `${args.name} is added in ${args.category}. \n`;
    }else{
      msg += `${args.name} already exists in ${args.category} cannot add it again. \n`;
    }
  })
  return msg;
};

export const botUpdateProfileInfo = async args => {
  const res = await saveProfileInfoDB(args);
  console.log('res', res);
  if (res) {
    await saveProfileInfo(args);
    return true;
  }
  return false;
};
