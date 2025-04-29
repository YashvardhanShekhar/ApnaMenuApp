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
import {useNavigation, StackActions} from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { handleSignIn } from '../components/authentication';

const SCREEN_WIDTH = Dimensions.get('window').width;


export default function App() {
  const navigation = useNavigation();
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

  // Get random food set
  const getRandomFoodSet = () => {
    // Copy array and shuffle
    const shuffled = [...indianFoodIcons].sort(() => 0.5 - Math.random());
    // Get first 5 items
    return shuffled.slice(0, 5);
  };

  // Loading animation sequence
  useEffect(() => {
    if (loading) {
      // Select a random set of 5 food icons
      setCurrentFoodSet(getRandomFoodSet());

      // Show loading animation
      Animated.timing(loadingOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Animated food icons in sequence
      const animateSequence = () => {
        Animated.stagger(200, [
          animateFood(food1Anim),
          animateFood(food2Anim),
          animateFood(food3Anim),
          animateFood(food4Anim),
          animateFood(food5Anim),
        ]).start(() => {
          // Reset values and repeat animation with new food set
          food1Anim.setValue(0);
          food2Anim.setValue(0);
          food3Anim.setValue(0);
          food4Anim.setValue(0);
          food5Anim.setValue(0);

          if (loading) {
            setCurrentFoodSet(getRandomFoodSet());
            setTimeout(animateSequence, 300);
          }
        });
      };

      animateSequence();
    } else {
      // Hide loading animation
      Animated.timing(loadingOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // Reset all animation values
        food1Anim.setValue(0);
        food2Anim.setValue(0);
        food3Anim.setValue(0);
        food4Anim.setValue(0);
        food5Anim.setValue(0);
      });
    }
  }, [loading]);

  // Function to animate each food icon
  const animateFood = animValue => {
    return Animated.timing(animValue, {
      toValue: 1,
      duration: 1500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
  };

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
    await handleSignIn(navigation)
    setLoading(false)
  };

  const toggleTheme = () => {
    setDarkTheme(prev => !prev);
  };

  const themeStyles = darkTheme ? darkThemeStyles : lightThemeStyles;

  // Function to render food icon based on type
  const renderFoodIcon = (icon, size) => {
    if (icon.type === 'FontAwesome5') {
      return <FontAwesome5 name={icon.name} size={size} color="#000" />;
    } else {
      return (
        <MaterialCommunityIcons name={icon.name} size={size} color="#000" />
      );
    }
  };

  return (
    <View style={[styles.container, themeStyles.container]}>
      <StatusBar
        barStyle={darkTheme ? 'light-content' : 'dark-content'}
        backgroundColor={darkTheme ? '#1d1d1d' : '#F4F5F7'}
      />

      <TouchableOpacity style={styles.bulbContainer} onPress={toggleTheme}>
        <Feather
          name={darkTheme ? 'sun' : 'moon'}
          size={28}
          color={darkTheme ? '#FFD700' : '#222'}
        />
      </TouchableOpacity>

      <Animated.Text
        style={[
          styles.logo,
          themeStyles.text,
          {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
        ]}>
        🍽️ ApnaMenu
      </Animated.Text>

      <Animated.Text
        style={[
          styles.heading,
          themeStyles.text,
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

      {/* Custom Indian Food Loading Animation - at the bottom of the screen */}
      <Animated.View
        style={[styles.loadingContainer, {opacity: loadingOpacity}]}>
        {/* Row of food icons at the bottom */}
        {currentFoodSet.length > 0 && (
          <>
            <Animated.View
              style={[
                styles.foodIcon,
                {
                  transform: [
                    {
                      translateY: food1Anim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, -20, 0],
                      }),
                    },
                    {
                      translateX: food1Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -10],
                      }),
                    },
                  ],
                  opacity: food1Anim.interpolate({
                    inputRange: [0, 0.1, 0.9, 1],
                    outputRange: [0, 1, 1, 0],
                  }),
                },
              ]}>
              {renderFoodIcon(currentFoodSet[0], 24)}
              {/* <Text style={styles.iconLabel}>{currentFoodSet[0].label}</Text> */}
            </Animated.View>

            <Animated.View
              style={[
                styles.foodIcon,
                {
                  transform: [
                    {
                      translateY: food2Anim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, -30, 0],
                      }),
                    },
                    {
                      translateX: food2Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -5],
                      }),
                    },
                  ],
                  opacity: food2Anim.interpolate({
                    inputRange: [0, 0.1, 0.9, 1],
                    outputRange: [0, 1, 1, 0],
                  }),
                },
              ]}>
              {renderFoodIcon(currentFoodSet[1], 24)}
              {/* <Text style={styles.iconLabel}>{currentFoodSet[1].label}</Text> */}
            </Animated.View>

            <Animated.View
              style={[
                styles.foodIcon,
                {
                  transform: [
                    {
                      translateY: food3Anim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, -40, 0],
                      }),
                    },
                  ],
                  opacity: food3Anim.interpolate({
                    inputRange: [0, 0.1, 0.9, 1],
                    outputRange: [0, 1, 1, 0],
                  }),
                },
              ]}>
              {renderFoodIcon(currentFoodSet[2], 24)}
              {/* <Text style={styles.iconLabel}>{currentFoodSet[2].label}</Text> */}
            </Animated.View>

            <Animated.View
              style={[
                styles.foodIcon,
                {
                  transform: [
                    {
                      translateY: food4Anim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, -30, 0],
                      }),
                    },
                    {
                      translateX: food4Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 5],
                      }),
                    },
                  ],
                  opacity: food4Anim.interpolate({
                    inputRange: [0, 0.1, 0.9, 1],
                    outputRange: [0, 1, 1, 0],
                  }),
                },
              ]}>
              {renderFoodIcon(currentFoodSet[3], 24)}
              {/* <Text style={styles.iconLabel}>{currentFoodSet[3].label}</Text> */}
            </Animated.View>

            <Animated.View
              style={[
                styles.foodIcon,
                {
                  transform: [
                    {
                      translateY: food5Anim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, -20, 0],
                      }),
                    },
                    {
                      translateX: food5Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 10],
                      }),
                    },
                  ],
                  opacity: food5Anim.interpolate({
                    inputRange: [0, 0.1, 0.9, 1],
                    outputRange: [0, 1, 1, 0],
                  }),
                },
              ]}>
              {renderFoodIcon(currentFoodSet[4], 24)}
              {/* <Text style={styles.iconLabel}>{currentFoodSet[4].label}</Text> */}
            </Animated.View>
          </>
        )}

        <Text style={[styles.loadingText, themeStyles.loadingText]}>
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
    padding: 20,
    justifyContent: 'center',
  },
  bulbContainer: {
    position: 'absolute',
    top: 20,
    right: 16,
    padding: 8,
    zIndex: 10,
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
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  googleButtonDisabled: {
    backgroundColor: '#7baaf7', // Lighter blue when disabled
  },
  googleButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  // Food loading animation styles
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    position: 'absolute',
    bottom: 80,
    width: SCREEN_WIDTH,
    paddingHorizontal: 10,
  },
  foodIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
    width: 60,
  },
  iconLabel: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
    color: '#000',
  },
  loadingText: {
    position: 'absolute',
    bottom: -30,
    width: SCREEN_WIDTH,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
});

const lightThemeStyles = StyleSheet.create({
  container: {
    backgroundColor: '#F4F5F7',
  },
  text: {
    color: '#1d1d1d',
  },
  loadingText: {
    color: '#333',
  },
});

const darkThemeStyles = StyleSheet.create({
  container: {
    backgroundColor: '#1d1d1d',
  },
  text: {
    color: '#F4F5F7',
  },
  loadingText: {
    color: '#F4F5F7',
  },
});
