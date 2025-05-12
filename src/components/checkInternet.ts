import NetInfo from '@react-native-community/netinfo';
import Snackbar from 'react-native-snackbar';

export const checkInternet = async () => {
  const state = await NetInfo.fetch();

  if (!state.isConnected) {
    Snackbar.show({
      text: 'It seems that you are not connected to the Internet',
      duration: Snackbar.LENGTH_SHORT,
      action: {
        text: 'OK',
        textColor: '#0F766E',
      },
    });
    return false;
  }
  return true;

};
