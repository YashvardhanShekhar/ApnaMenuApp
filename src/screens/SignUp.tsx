import React from 'react';
import {View, KeyboardAvoidingView, Platform, StyleSheet} from 'react-native';
import {Text, TextInput, Button, Surface} from 'react-native-paper';
import {Formik} from 'formik';
import * as Yup from 'yup';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Snackbar from 'react-native-snackbar';
import HapticFeedback from 'react-native-haptic-feedback';
import {useNavigation} from '@react-navigation/native';

const RegisterSchema = Yup.object().shape({
  restaurantName: Yup.string()
    .min(2, 'Too Short!')
    .required('Restaurant name is required'),
  restaurantUrl: Yup.string()
    .min(2, 'Too Short!')
    .required('Restaurant URL is required'),
});

const FirstTimeRegisterScreen = () => {
  const navigation = useNavigation();

  const handleRegister = async (values: {
    restaurantName: string;
    restaurantUrl: string;
  }) => {
    try {
      const {restaurantName, restaurantUrl} = values;
      const user =  await AsyncStorage.getItem('user');  
      const email = JSON.parse(user).email;
      const ref = firestore().collection('restaurants').doc(restaurantUrl)

      const rest = await ref.get();
      if (rest.exists) {
        console.log('Restaurant exist, creating new user...');
        
        throw new Error('Restaurant URL already exists');
      }

      console.log(restaurantUrl)
      await ref.set({name:restaurantName});
      await firestore().collection('users').doc(email).set({url:restaurantUrl});
      
      

      // Haptic Feedback
      HapticFeedback.trigger('impactLight');

      // Show Snackbar
      Snackbar.show({
        text: 'Registration successful!',
        duration: Snackbar.LENGTH_SHORT,
      });

      // Navigate to Home
      navigation.reset({
        index: 0,
        routes: [{name: 'Home'}],
      });
    } catch (error) {
      console.error('Registration error:', error);
      Snackbar.show({
        text: error.message,
        backgroundColor: 'smokewhite',
      });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}>
      <Surface style={styles.surface} elevation={4}>
        <Text style={styles.header}>Register Your Restaurant</Text>
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

              <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.button}>
                Register
              </Button>
            </View>
          )}
        </Formik>
      </Surface>
    </KeyboardAvoidingView>
  );
};

export default FirstTimeRegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fa',
    justifyContent: 'center',
    padding: 20,
  },
  surface: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  form: {
    marginTop: 10,
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 20,
    paddingVertical: 5,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 5,
  },
});
