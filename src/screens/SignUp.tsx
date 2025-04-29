import React from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import {Text, TextInput, Button} from 'react-native-paper';
import {Formik} from 'formik';
import * as Yup from 'yup';
import Snackbar from 'react-native-snackbar';
import HapticFeedback from 'react-native-haptic-feedback';
import {useNavigation} from '@react-navigation/native';
import {
  addNewRestaurant,
  restaurantUrlExists,
  addNewUser,
} from '../components/databaseManager';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RegisterSchema = Yup.object().shape({
  restaurantName: Yup.string()
    .min(2, 'Too Short!')
    .required('Restaurant name is required'),
  restaurantUrl: Yup.string()
    .min(2, 'Too Short!')
    .required('Restaurant URL is required')
    .test('unique-url', 'URL is already taken', async url => {
      if (!url) return true;
      const isExists = await restaurantUrlExists(url);
      if (isExists) {
        return false;
      }
      return true;
    }),
});

const FirstTimeRegisterScreen = ({
  route,
  navigation,
}: {
  route: {params: any & {email:string}};
  navigation: any;
}) => {
  // const navigation = useNavigation();
  const email = route.params.email;
  
  const handleRegister = async (values: {
    restaurantName: string;
    restaurantUrl: string;
  }) => {
    const {restaurantName, restaurantUrl} = values;
    await addNewRestaurant(email, restaurantName, restaurantUrl);
    await AsyncStorage.setItem('url', restaurantUrl);
    navigation.reset({
      index: 0,
      routes: [{name: 'Home'}],
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}>
      <View style={styles.card}>
        <Image
          source={require('../assets/image.png')} // Replace with your panda logo
          style={styles.logo}
        />

        <Text style={styles.welcomeText}>Welcome Back To</Text>
        <Text style={styles.brandText}>Panda Express</Text>

        <Formik
          initialValues={{restaurantName: '', restaurantUrl: ''}}
          validationSchema={RegisterSchema}
          onSubmit={handleRegister}>
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
          }) => (
            <View style={styles.form}>
              <TextInput
                label="Restaurant Name"
                mode="outlined"
                value={values.restaurantName}
                onChangeText={handleChange('restaurantName')}
                onBlur={handleBlur('restaurantName')}
                error={!!(errors.restaurantName && touched.restaurantName)}
                style={styles.input}
              />
              {errors.restaurantName && touched.restaurantName && (
                <Text style={styles.errorText}>{errors.restaurantName}</Text>
              )}

              <TextInput
                label="Restaurant URL"
                mode="outlined"
                value={values.restaurantUrl}
                onChangeText={handleChange('restaurantUrl')}
                onBlur={handleBlur('restaurantUrl')}
                error={!!(errors.restaurantUrl && touched.restaurantUrl)}
                style={styles.input}
              />
              {errors.restaurantUrl && touched.restaurantUrl && (
                <Text style={styles.errorText}>{errors.restaurantUrl}</Text>
              )}

              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <Button
                mode="contained"
                onPress={() => handleSubmit()}
                style={styles.button}
                contentStyle={{paddingVertical: 8}}>
                Log In
              </Button>
            </View>
          )}
        </Formik>
      </View>
    </KeyboardAvoidingView>
  );
};

export default FirstTimeRegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e3f2f1', // soft green background
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    width: '100%',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    elevation: 5,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 20,
    color: '#555',
    marginBottom: 5,
  },
  brandText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 15,
    backgroundColor: 'white',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#000', // black login button
    borderRadius: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 5,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  forgotPasswordText: {
    color: '#555',
    fontSize: 13,
  },
});
