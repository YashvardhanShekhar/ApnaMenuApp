import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  updateDoc,
  deleteField,
  getFirestore,
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import Snackbar from 'react-native-snackbar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {fetchUrl, fetchUser} from './storageService';

const db = getFirestore();
let rest: FirebaseFirestoreTypes.DocumentReference;
let user;

const setBasic = async () => {
  try {
    const url = await fetchUrl();
    if (!url) {
      throw new Error('URL not found in Storage');
    }
    rest = doc(collection(db, 'restaurants'), url);
    const tempRes = await fetchUser();
    if (!tempRes.email) {
      throw new Error('Email not found in Storage');
    }
    user = doc(collection(db, 'users'), tempRes.email);
  } catch (error: any) {
    Snackbar.show({
      text: error.message,
      duration: Snackbar.LENGTH_SHORT,
    });
  }
};

export const addNewDishDB = async (
  category: string,
  name: string,
  price: number,
) => {
  try {
    const status = await dishExists(category, name);
    if (status) {
      return 'exists';
    }
    const dishData = {
      name: name,
      price: price,
      status: true,
    };
    await setBasic();

    await setDoc(
      rest,
      {
        menu: {
          [category]: {
            [name]: dishData,
          },
        },
      },
      {merge: true},
    );
    Snackbar.show({
      text: name + ' added successfully',
      duration: Snackbar.LENGTH_SHORT,
      action: {
        text: 'OK',
        textColor: '#0F766E',
      },
    });
    return true;
  } catch (error: any) {
    Snackbar.show({
      text: error.message,
      duration: Snackbar.LENGTH_SHORT,
    });
    return false;
  }
};

export const deleteDishDB = async (category: string, name: string) => {
  try {
    await setBasic();
    const url = await AsyncStorage.getItem('url');
    const path = 'menu.' + category + '.' + name;
    console.log(path);
    await updateDoc(rest, {
      [path]: deleteField(),
    });

    const res = await getDoc(rest);
    const data = res.data();
    const size = Object.keys(data?.menu?.[category] || {}).length;
    if (size === 0) {
      await updateDoc(rest, {
        [`menu.${category}`]: deleteField(),
      }).then(() => {
        Snackbar.show({
          text: `${category} along with ${name} has been deleted`,
          duration: Snackbar.LENGTH_SHORT,
          action: {
            text: 'OK',
            textColor: '#0F766E',
          },
        });
      });
    } else {
      Snackbar.show({
        text: name + ' deleted successfully',
        duration: Snackbar.LENGTH_SHORT,
        action: {
          text: 'OK',
          textColor: '#0F766E',
        },
      });
    }
  } catch (error: any) {
    Snackbar.show({
      text: error.message,
      duration: Snackbar.LENGTH_SHORT,
    });
    return false;
  }
  return true;
};

export const setAvailability = async (
  category: string,
  dishName: string,
  status: boolean,
) => {
  try {
    await setBasic();
    await setDoc(
      rest,
      {
        menu: {
          [category]: {
            [dishName]: {
              status: status,
            },
          },
        },
      },
      {merge: true},
    ).then(() => {
      Snackbar.show({
        text: status
          ? dishName + ' is now available'
          : dishName + ' is now sold out',
        duration: Snackbar.LENGTH_SHORT,
        action: {
          text: 'OK',
          textColor: '#0F766E',
        },
      });
    });
  } catch (error: any) {
    Snackbar.show({
      text: error.message,
      duration: Snackbar.LENGTH_SHORT,
    });
  }
};

export const dishExists = async (
  category: string,
  name: string,
): Promise<boolean> => {
  const url = await AsyncStorage.getItem('url');
  const restaurantDoc = await getDoc(rest);

  if (restaurantDoc.exists) {
    const menu = restaurantDoc.data()?.menu;
    return menu?.[category]?.[name] !== undefined;
  }
  return false;
};

export const categoryExists = async (category: string): Promise<boolean> => {
  await setBasic();
  const restaurantDoc = await getDoc(rest);
  if (restaurantDoc.exists) {
    const menu = restaurantDoc.data()?.menu;
    return menu?.[category] !== undefined;
  }
  return false;
};

export const restaurantUrlExists = async (url: string): Promise<boolean> => {
  const docRef = doc(db, 'restaurants', url);
  const restaurantDoc = await getDoc(docRef);

  if (restaurantDoc.exists) {
    return true;
  }
  return false;
};

export const addNewRestaurantDB = async (
  email: string,
  name: string,
  restaurantUrl: string,
  info: ProfileInformation,
) => {
  try {
    const isExists = await restaurantUrlExists(restaurantUrl);
    if (isExists) {
      throw new Error('URL already exists');
    }
    await addNewUser(email, restaurantUrl);
    const docRef = doc(db, 'restaurants', restaurantUrl);
    await setDoc(
      docRef,
      {
        linkedUsers: {
          [email]: {email: email, name: name},
        },
        info: info,
      },
      {merge: true},
    ).then(() => {
      Snackbar.show({
        text: `Restaurant added successfully`,
        duration: Snackbar.LENGTH_SHORT,
        action: {
          text: 'OK',
          textColor: '#0F766E',
        },
      });
    });
  } catch (error: any) {
    Snackbar.show({
      text: error.message,
      duration: Snackbar.LENGTH_SHORT,
    });
  }
};

export const addNewUser = async (email: string, restaurantUrl: string) => {
  await setDoc(doc(db, 'users', email), {
    url: restaurantUrl,
  });
};

export const deleteUsers = async (data: LinkedUsers) => {
  try {
    await Promise.all(
      Object.keys(data).map(async email => {
        await deleteDoc(doc(db, 'users', email));
      }),
    );
    Snackbar.show({
      text: 'selected users were deleted',
      duration: Snackbar.LENGTH_SHORT,
    });
  } catch (error: any) {
    Snackbar.show({
      text: error.message,
      duration: Snackbar.LENGTH_SHORT,
    });
  }
};

export const fetchAllData = async (url: string) => {
  try {
    await setBasic();
    const restaurantDoc = await getDoc(rest);

    if (restaurantDoc.exists) {
      return restaurantDoc.data();
    }
    throw new Error('Restaurant not found');
  } catch (error: any) {
    Snackbar.show({
      text: error.message,
      duration: Snackbar.LENGTH_SHORT,
    });
    return null;
  }
};

export const saveProfileInfoDB = async (info: ProfileInformation) => {
  try {
    await setBasic();
    await setDoc(
      rest,
      {
        info: info,
      },
      {merge: true},
    ).then(() => {
      Snackbar.show({
        text: 'Profile details updated',
        duration: Snackbar.LENGTH_SHORT,
        action: {
          text: 'OK',
          textColor: '#0F766E',
        },
      });
    });
    return true;
  } catch (error: any) {
    Snackbar.show({
      text: error.message,
      duration: Snackbar.LENGTH_SHORT,
    });
    return false;
  }
};

export const emailExists = async (email: string): Promise<boolean> => {
  const docRef = doc(db, 'users', email);
  const res = await getDoc(docRef);

  if (res.exists) {
    return true;
  } else {
    return false;
  }
};

export const saveLinkedUsersDB = async (data: LinkedUsers) => {
  try {
    const restaurantUrl = await AsyncStorage.getItem('url');
    if (!restaurantUrl) {
      throw new Error('URL not found in Storage');
    }
    await Promise.all(
      Object.keys(data).map(async email => {
        await addNewUser(email, restaurantUrl);
      }),
    );

    await updateDoc(doc(db, 'restaurants', restaurantUrl), {
      linkedUsers: data,
    }).then(() => {
      Snackbar.show({
        text: 'Users updated',
        duration: Snackbar.DISMISS_EVENT_CONSECUTIVE,
        action: {
          text: 'OK',
          textColor: '#0F766E',
        },
      });
    });
  } catch (error: any) {
    Snackbar.show({
      text: error.message,
      duration: Snackbar.DISMISS_EVENT_SWIPE,
    });
  }
};

export const deleteAccountPermanently = async (email: string, url: string) => {
  try {
    await deleteDoc(doc(db, 'users', email));
    await deleteDoc(doc(db, 'restaurants', url));
    Snackbar.show({
      text: url + ' has been deleted Permanently',
      duration: Snackbar.LENGTH_LONG,
    });
  } catch (error) {
    console.log(error);
    Snackbar.show({
      text: 'some error has occurred try again',
      duration: Snackbar.LENGTH_LONG,
    });
  }
};

export const deleteUsersInUsers = async (arr: string[]) => {
  const url = await fetchUrl();
  try {
    await Promise.all(
      arr.map(async email => {
        const userDoc = await getDoc(doc(db, 'users', email));
        const resUrl = userDoc.data()?.url;
        if (url === resUrl) {
          await deleteDoc(doc(db, 'users', email));
        } else {
          Snackbar.show({
            text: email + ' has linked to different restaurant',
            duration: Snackbar.LENGTH_LONG,
          });
        }
      }),
    );
  } catch (error) {
    console.log(error);
    Snackbar.show({
      text: 'some error has occurred try again',
      duration: Snackbar.LENGTH_LONG,
    });
  }
};

export const addMenuDB = async (menu: Menu) => {
  try {
    const url = await AsyncStorage.getItem('url');
    if (!url) {
      throw new Error('URL not found in Storage');
    }

    await setDoc(
      doc(db, 'restaurants', url),
      {
        menu: menu,
      },
      {merge: true},
    ).then(() => {
      Snackbar.show({
        text: 'menu updated successfully',
        duration: Snackbar.LENGTH_SHORT,
        action: {
          text: 'OK',
          textColor: '#0F766E',
        },
      });
    });
  } catch (error: any) {
    Snackbar.show({
      text: error.message,
      duration: Snackbar.LENGTH_SHORT,
    });
  }
};

export const saveMessagesDB = async (
  deleteStatus: boolean,
  oldMsg1: Message,
  oldMsg2: Message,
  newMsg1: Message,
  newMsg2: Message,
) => {
  try {
    const user = await fetchUser();
    const email = user.email;
    if (!email) {
      throw new Error('email not found in Storage');
    }
    if (deleteStatus) {
      await setDoc(
        doc(db, 'users', email),
        {
          messages: arrayRemove(oldMsg1, oldMsg2),
        },
        {merge: true},
      );
    }

    await setDoc(
      doc(db, 'users', email),
      {
        messages: arrayUnion(newMsg1, newMsg2),
      },
      {merge: true},
    );

    return true;
  } catch (error) {
    Snackbar.show({
      text: 'some error has occurred while saving messages.',
      duration: Snackbar.LENGTH_SHORT,
    });
  }
};

export const fetchMessagesDB = async () => {
  try {
    const user = await fetchUser();
    const email = user.email;
    if (!email) {
      throw new Error('email not found in Storage');
    }
    const res = await getDoc(doc(db, 'users', email));
    const data: any = res.data();
    return data.messages;
  } catch (error) {
    Snackbar.show({
      text: 'some error has occurred while fetching messages.',
      duration: Snackbar.LENGTH_SHORT,
    });
    return [];
  }
};