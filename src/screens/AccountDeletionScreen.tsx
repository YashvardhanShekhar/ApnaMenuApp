import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  NavigationProp,
} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import {Formik} from 'formik';
import * as Yup from 'yup';
import Snackbar from 'react-native-snackbar';
import {TextInput} from 'react-native';
import {deleteAccountPermanently} from '../services/databaseManager';
import {fetchUrl, fetchUser} from '../services/storageService';
import {handleLogOut} from '../services/authentication';
import {checkInternet} from '../components/checkInternet';

// const navigation = useNavigation();
// Validation schema
const deleteAccountSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required')
    .test(
      'email-match',
      'Email does not match your account',
      async function (value) {
        // Compare with the email
        const user = await fetchUser();
        const email = user.email;
        return value === email;
      },
    ),
  restaurantUrl: Yup.string()
    .required('Restaurant URL is required')
    .test(
      'url-match',
      'URL does not match your restaurant',
      async function (value) {
        // Compare with the url
        const url = await fetchUrl();
        return value === url;
      },
    ),
});

const DeleteAccountScreen = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  const [email, setEmail] = useState('');
  const [url, setUrl] = useState('');

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await fetchUser();
        const url: string = (await fetchUrl()) ?? '';
        setEmail(user.email);
        setUrl(url);
      } catch (error) {
        console.error('Error loading user data:', error);
        Snackbar.show({
          text: 'Failed to load user data',
          duration: Snackbar.LENGTH_SHORT,
        });
        navigation.goBack();
      }
    };
    loadUserData();
  }, []);

  // Hide tab bar on this screen
  useEffect(() => {
    const parent = navigation.getParent();
    parent?.setOptions({
      tabBarStyle: {display: 'none'},
    });

    return () => {
      parent?.setOptions({
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 15,
          left: 20,
          right: 20,
          backgroundColor: '#ffffff',
          borderRadius: 25,
          height: 55,
          paddingBottom: 8,
          paddingTop: 8,
          marginHorizontal: 10,
        },
      });
    };
  }, [navigation]);

  const handleDeleteAccount = async (values: DeleteAccountValues) => {
    setDeleteInProgress(true);
    const ci = await checkInternet();
    if (!ci) {
      setDeleteInProgress(false);
      return;
    }
    // deleteAccountPermanently(values.email, values.restaurantUrl);
    Alert.alert(`${values.email} ${values.restaurantUrl} deleted`);
    setDeleteInProgress(false);
    await handleLogOut();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Delete Account</Text>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.warningContainer}>
            <Icon
              name="alert-triangle"
              size={32}
              color="#EF4444"
              style={styles.warningIcon}
            />
            <Text style={styles.warningTitle}>Delete Your Account</Text>
            <Text style={styles.warningText}>
              This action is permanent and cannot be undone. All your data,
              settings, and history will be permanently deleted.
            </Text>
          </View>

          <Formik
            initialValues={{email: '', restaurantUrl: ''}}
            enableReinitialize
            validationSchema={deleteAccountSchema}
            onSubmit={handleDeleteAccount}
            validateOnChange={true}
            validateOnBlur={true}>
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              isValid,
              isSubmitting,
            }) => (
              <View style={styles.formContainer}>
                <Text style={styles.confirmText}>
                  To confirm deletion, please enter your email address and
                  restaurant URL as shown below:
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      touched.email && errors.email && styles.inputError,
                    ]}
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    placeholder={email}
                    placeholderTextColor="#94A3B8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!deleteInProgress}
                  />
                  {touched.email && errors.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Restaurant URL</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      touched.restaurantUrl &&
                        errors.restaurantUrl &&
                        styles.inputError,
                    ]}
                    value={values.restaurantUrl}
                    onChangeText={handleChange('restaurantUrl')}
                    onBlur={handleBlur('restaurantUrl')}
                    placeholder={url}
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="none"
                    editable={!deleteInProgress}
                  />
                  {touched.restaurantUrl && errors.restaurantUrl && (
                    <Text style={styles.errorText}>{errors.restaurantUrl}</Text>
                  )}
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => navigation.goBack()}
                    disabled={deleteInProgress}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.deleteButton,
                      (!isValid || isSubmitting || deleteInProgress) &&
                        styles.disabledButton,
                    ]}
                    onPress={()=>handleSubmit}
                    disabled={!isValid || isSubmitting || deleteInProgress}>
                    {deleteInProgress ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.deleteButtonText}>
                        Delete Forever
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Formik>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  warningContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  warningIcon: {
    marginBottom: 12,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 8,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 14,
    color: '#7F1D1D',
    textAlign: 'center',
    lineHeight: 20,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  confirmText: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 12,
    lineHeight: 20,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F766E',
    marginBottom: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#334155',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    marginLeft: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default DeleteAccountScreen;
