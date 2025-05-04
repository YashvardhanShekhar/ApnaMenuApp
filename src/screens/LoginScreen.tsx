import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  TouchableOpacity,
  StatusBar,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import {StackActions} from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {handleSignIn} from '../services/authentication';
import { checkInternet } from '../components/chechInternet';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function App() {
  const [loading, setLoading] = useState(false);
  const [darkTheme, setDarkTheme] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Food loading animation values
  const loadingOpacity = useRef(new Animated.Value(0)).current;

  // Food icons animation values
  const food1Anim = useRef(new Animated.Value(0)).current;
  const food2Anim = useRef(new Animated.Value(0)).current;
  const food3Anim = useRef(new Animated.Value(0)).current;
  const food4Anim = useRef(new Animated.Value(0)).current;
  const food5Anim = useRef(new Animated.Value(0)).current;

  // Indian food icons - custom set
  const indianFoodIcons = [
    {type: 'FontAwesome5', name: 'bread-slice', label: 'Chapati'},
    {type: 'MaterialCommunityIcons', name: 'rice', label: 'Biryani'},
    {type: 'MaterialCommunityIcons', name: 'food-variant', label: 'Paratha'},
    {type: 'MaterialCommunityIcons', name: 'food', label: 'Curry'},
    {type: 'MaterialCommunityIcons', name: 'food-apple', label: 'Vegetables'},
    {type: 'MaterialCommunityIcons', name: 'glass-wine', label: 'Lassi'},
    {type: 'FontAwesome5', name: 'pepper-hot', label: 'Spice'},
    {type: 'MaterialCommunityIcons', name: 'pot-steam', label: 'Dal'},
    {type: 'MaterialCommunityIcons', name: 'bowl', label: 'Raita'},
    {type: 'MaterialCommunityIcons', name: 'cupcake', label: 'Dessert'},
  ];

  // Current set of food icons for animation - will change each time
  const [currentFoodSet, setCurrentFoodSet] = useState([]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);


  const onPressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const SignIn = async () => {
    setLoading(true);
    const ci = await checkInternet();
    if (!ci) {
      setLoading(false);
      return;
    }
    await handleSignIn();
    setLoading(false);
  };



  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={darkTheme ? 'light-content' : 'dark-content'}
        backgroundColor={darkTheme ? '#1d1d1d' : '#F4F5F7'}
      />
      <Animated.Text
        style={[
          styles.logo,
          {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
        ]}>
        🍽️ ApnaMenu
      </Animated.Text>

      <Animated.Text
        style={[
          styles.heading,
          {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
        ]}>
        HELLO AND WELCOME!{'\n'}LET'S GET YOU STARTED!
      </Animated.Text>

      <Animated.View style={{transform: [{scale: buttonScale}], width: '100%'}}>
        <Pressable
          style={[styles.googleButton, loading && styles.googleButtonDisabled]}
          onPress={SignIn}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          disabled={loading}>
          <Text style={styles.googleButtonText}>
            {loading ? 'Signing in...' : 'Continue with Google'}
          </Text>
        </Pressable>
      </Animated.View>

      <Animated.View
        style={[styles.loadingContainer, {opacity: loadingOpacity}]}>
        
        <Text style={[styles.loadingText]}>
          wait we are fetching your details ...
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 30,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 40,
  },
  googleButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  googleButtonDisabled: {
    backgroundColor: '#7baaf7',
  },
  googleButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 80,
    width: SCREEN_WIDTH,
  },
  loadingText: {
    position: 'absolute',
    bottom: -30,
    width: SCREEN_WIDTH,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
});