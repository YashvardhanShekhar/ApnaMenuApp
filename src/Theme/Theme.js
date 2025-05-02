// src/theme/theme.js
import {MD3LightTheme as DefaultTheme} from 'react-native-paper';

const theme = {
  ...DefaultTheme,
  myOwnProperty: true, // custom non-color props if needed
  colors: {
    ...DefaultTheme.colors,
    primary: '#2ABAA7',
    secondary: '#1F2D5A',
    background: '#F5F6FA',
    surface: '#FFFFFF',
    text: '#1F2D5A',
    myOwnColor: '#BADA55', // custom named color
  },
  roundness: 6, // controls border radius
  fonts: {
    ...DefaultTheme.fonts,
    medium: {
      ...DefaultTheme.fonts.medium,
      fontFamily: 'System',
    },
  },
};

export default theme;
