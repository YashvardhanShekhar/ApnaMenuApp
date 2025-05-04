import NetInfo from '@react-native-community/netinfo';
import Snackbar from 'react-native-snackbar';

export const checkInternet = async () => {
  const state = await NetInfo.fetch();

  if (!state.isConnected) {
    Snackbar.show({
      text: 'No internet connection',
      duration: Snackbar.LENGTH_SHORT,
    });
    return false;
  }

  try {
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    await fetch('https://www.google.com', {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    return true;
  } catch (err) {
    Snackbar.show({
      text: 'It seems that you are not connected to the Internet',
      duration: Snackbar.LENGTH_LONG,
    });
    return false;
  }
};
