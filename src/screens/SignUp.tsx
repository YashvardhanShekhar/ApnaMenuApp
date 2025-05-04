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
import { checkInternet } from '../components/chechInternet';

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
    .matches(/^[^/]*$/, "URL cannot contain forward slashes ei : ' / '")
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

const RestaurantRegistrationScreen = ({route}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nameInputRef = useRef(null);

  const email = route?.params?.email || '';
  const name = route?.params?.name || '';

  const handleFormSubmit = async values => {
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

    await addNewRestaurantDB(
      email,
      name,
      values.restaurantUrl.toLowerCase(),
      info,
    );

    const linkedUser: LinkedUsers = {
      [email]: {
        name: name,
        email: email,
      },
    };

    await saveProfileInfo(info);
    await saveLinkedUsers(linkedUser);
    await saveUrl(values.restaurantUrl);

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
            {/* <View style={styles.logoContainer}>
              <View style={styles.logoPlaceholder}>
                <Icon name="image" size={40} color="#64748B" />
              </View>
              <TouchableOpacity style={styles.uploadButton}>
                <Text style={styles.uploadButtonText}>Upload Logo</Text>
              </TouchableOpacity>
            </View> */}

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
                      placeholder="yourrestaurant (no spaces)"
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
                        {values.restaurantUrl.toLowerCase() || 'yourrestaurant'}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 12,
  },
  formContainer: {
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  uploadButton: {
    backgroundColor: '#CBD5E1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  uploadButtonText: {
    color: '#334155',
    fontWeight: '600',
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    height: 56,
  },
  inputOutline: {
    borderRadius: 12,
    borderWidth: 1,
  },
  errorText: {
    color: '#DC2626',
    paddingLeft: 0,
    fontSize: 14,
  },
  urlPreview: {
    marginTop: 6,
    fontSize: 13,
    color: '#64748B',
    paddingLeft: 4,
  },
  urlHighlight: {
    color: '#0F766E',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#0F766E',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#94A3B8',
    opacity: 0.7,
  },
  buttonIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  policyText: {
    marginLeft: 8,
    color: '#64748B',
    fontSize: 14,
    flexShrink: 1,
  },
});

export default RestaurantRegistrationScreen;
