import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {TextInput, HelperText} from 'react-native-paper';
import Icon from 'react-native-vector-icons/Feather';
import {Formik} from 'formik';
import * as Yup from 'yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as NavigationService from '../services/navigationService';
import {
  addNewRestaurantDB,
  restaurantUrlExists,
  saveProfileInfoDB,
} from '../services/databaseManager';
import {
  saveLinkedUsers,
  saveProfileInfo,
  saveUrl,
} from '../services/storageService';
import {checkInternet} from '../components/checkInternet';
import { styles } from '../styles/signupScreenStyle';

// Form validation schema
const RestaurantRegistrationSchema = Yup.object().shape({
  restaurantName: Yup.string()
    .min(3, 'Restaurant name must be at least 3 characters')
    .required('Restaurant name is required'),
  restaurantUrl: Yup.string()
    .transform(value => value?.toLowerCase())
    .min(3, 'Restaurant URL must be at least 3 characters')
    .required('Restaurant URL is required')
    .matches(/^\S*$/, 'URL cannot contain spaces')
    .matches(
      /^[a-zA-Z0-9-]*$/,
      'Only letters, numbers, and hyphens (-) are allowed',
    )

    .test('unique-url', 'URL is already taken', async url => {
      if (!url) return true;
      const isExists = await restaurantUrlExists(url);
      if (isExists) {
        return false;
      }
      return true;
    }),
  phoneNumber: Yup.string().matches(
    /^[0-9]{10}$/,
    'Phone number must be 10 digits',
  ),
  address: Yup.string().min(5, 'Address is too short'),
});

const RestaurantRegistrationScreen = ({route}:{route:any}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nameInputRef = useRef(null);

  const email = route?.params?.email || '';
  const name = route?.params?.name || '';

  const handleFormSubmit = async (values:any) => {
    setIsSubmitting(true);

    const ci = await checkInternet();
    if (!ci) {
      setIsSubmitting(false);
      return;
    }

    const info: ProfileInformation = {
      name: values.restaurantName,
      phoneNumber: values.phoneNumber,
      address: values.address,
      description: '',
    };

    await addNewRestaurantDB(email, name, values.restaurantUrl.toLowerCase(), info);

    const linkedUser: LinkedUsers = {
      [email]: {
        name: name,
        email: email,
      },
    };

    await saveProfileInfo(info);
    await saveLinkedUsers(linkedUser);
    await saveUrl(values.restaurantUrl.toLowerCase());

    NavigationService.reset('Home');

    setIsSubmitting(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#F8FAFC" barStyle="dark-content" />
        <View style={styles.header}>
          {/* <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#0F172A" />
          </TouchableOpacity> */}
          <Text style={styles.headerTitle}>Restaurant Registration </Text>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{flex: 1}}>
          <ScrollView
            style={styles.formContainer}
            keyboardShouldPersistTaps="handled">
            <Formik
              initialValues={{
                restaurantName: '',
                restaurantUrl: '',
                cuisineType: '',
                phoneNumber: '',
                address: '',
              }}
              validationSchema={RestaurantRegistrationSchema}
              validateOnBlur={true}
              onSubmit={handleFormSubmit}>
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
                isValid,
                isValidating,
              }) => (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Restaurant Name</Text>
                    <TextInput
                      mode="outlined"
                      style={styles.input}
                      value={values.restaurantName}
                      onChangeText={handleChange('restaurantName')}
                      onBlur={handleBlur('restaurantName')}
                      error={
                        !!(touched.restaurantName && errors.restaurantName)
                      }
                      ref={nameInputRef}
                      outlineStyle={styles.inputOutline}
                      theme={{colors: {primary: '#0F766E', text: '#0F172A'}}}
                      left={<TextInput.Icon icon="store" color="#64748B" />}
                      textColor="#0F172A"
                      placeholder="Enter your restaurant name"
                    />
                    {touched.restaurantName && errors.restaurantName && (
                      <HelperText
                        type="error"
                        visible={true}
                        style={styles.errorText}>
                        {errors.restaurantName}
                      </HelperText>
                    )}
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Restaurant URL </Text>
                    <TextInput
                      mode="outlined"
                      style={styles.input}
                      value={values.restaurantUrl}
                      onChangeText={handleChange('restaurantUrl')}
                      onBlur={handleBlur('restaurantUrl')}
                      error={!!(touched.restaurantUrl && errors.restaurantUrl)}
                      outlineStyle={styles.inputOutline}
                      theme={{colors: {primary: '#0F766E', text: '#0F172A'}}}
                      left={<TextInput.Icon icon="link" color="#64748B" />}
                      textColor="#0F172A"
                      placeholder="your-restaurant (no spaces)"
                    />
                    {touched.restaurantUrl && errors.restaurantUrl && (
                      <HelperText
                        type="error"
                        visible={true}
                        style={styles.errorText}>
                        {errors.restaurantUrl}
                      </HelperText>
                    )}
                    <Text style={styles.urlPreview}>
                      URL will look like : apnamenu.vercel.app/
                      <Text style={styles.urlHighlight}>
                        {values.restaurantUrl.toLowerCase() || 'your-restaurant'}
                      </Text>
                    </Text>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Phone Number</Text>
                    <TextInput
                      mode="outlined"
                      style={styles.input}
                      value={values.phoneNumber}
                      onChangeText={handleChange('phoneNumber')}
                      onBlur={handleBlur('phoneNumber')}
                      error={!!(touched.phoneNumber && errors.phoneNumber)}
                      keyboardType="phone-pad"
                      outlineStyle={styles.inputOutline}
                      theme={{colors: {primary: '#0F766E', text: '#0F172A'}}}
                      left={<TextInput.Icon icon="phone" color="#64748B" />}
                      textColor="#0F172A"
                      placeholder="10-digit phone number"
                    />
                    {touched.phoneNumber && errors.phoneNumber && (
                      <HelperText
                        type="error"
                        visible={true}
                        style={styles.errorText}>
                        {errors.phoneNumber}
                      </HelperText>
                    )}
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Restaurant Address</Text>
                    <TextInput
                      mode="outlined"
                      style={styles.input}
                      value={values.address}
                      onChangeText={handleChange('address')}
                      onBlur={handleBlur('address')}
                      error={!!(touched.address && errors.address)}
                      outlineStyle={styles.inputOutline}
                      theme={{colors: {primary: '#0F766E', text: '#0F172A'}}}
                      left={
                        <TextInput.Icon icon="map-marker" color="#64748B" />
                      }
                      textColor="#0F172A"
                      placeholder="Full restaurant address"
                      multiline
                    />
                    {touched.address && errors.address && (
                      <HelperText
                        type="error"
                        visible={true}
                        style={styles.errorText}>
                        {errors.address}
                      </HelperText>
                    )}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      (!isValid || isSubmitting || isValidating) &&
                        styles.disabledButton,
                    ]}
                    disabled={!isValid || isSubmitting || isValidating}
                    onPress={() => handleSubmit()}>
                    {isSubmitting ? (
                      <Text style={styles.submitButtonText}>
                        Registering...
                      </Text>
                    ) : (
                      <>
                        <Icon
                          name="check-circle"
                          size={20}
                          color="#fff"
                          style={styles.buttonIcon}
                        />
                        <Text style={styles.submitButtonText}>
                          Complete Registration
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </Formik>

            <View style={styles.footerContainer}>
              <Icon name="info" size={16} color="#64748B" />
              <Text style={styles.policyText}>
                By registering, you agree to our Terms of Service and Privacy
                Policy.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default RestaurantRegistrationScreen;
