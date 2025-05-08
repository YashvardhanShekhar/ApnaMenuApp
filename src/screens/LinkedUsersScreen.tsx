import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Yup from 'yup';
import {Formik, FieldArray, ErrorMessage, getIn} from 'formik';
import Snackbar from 'react-native-snackbar';
import {
  deleteUsersInUsers,
  emailExists,
  saveLinkedUsersDB,
} from '../services/databaseManager';
import {fetchLinkedUsers, saveLinkedUsers} from '../services/storageService';
import {checkInternet} from '../components/checkInternet';

// Validation schema
const userSchema = Yup.object().shape({
  users: Yup.array().of(
    Yup.object().shape({
      name: Yup.string()
        .required('Name is required')
        .min(2, 'Name must be at least 2 characters'),
      email: Yup.string()
        .email('Invalid email')
        .required('Email is required')
        .matches(/@gmail\.com$/, 'Email must be a Gmail')
        .test(
          'email-already-registered',
          'Email id is already registered',
          async function (email) {
            if (!email) return true;
            // Skip validation for original users (they're already in the database)
            if (this.parent.isOriginal) return true;
            const isExists = await emailExists(email);
            return !isExists;
          },
        ),
    }),
  ),
});

const LinkedUsersScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [initialValues, setInitialValues] = useState({users: []});
  const [originalUserEmails, setOriginalUserEmails] = useState([]);

  useEffect(() => {
    const parent = navigation.getParent(); // Get Tab Navigator
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
          marginHorizontal: 30, // Updated from 10 to 30
        },
      });
    };
  }, [navigation]);

  // Load users on component mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const linkedUsers = await fetchLinkedUsers();

        // Track the original user emails to determine which are from database
        const emailsList = Object.keys(linkedUsers);
        setOriginalUserEmails(emailsList);

        // Convert object to array for easier manipulation and mark original users
        const usersArray = Object.values(linkedUsers).map(user => ({
          ...user,
          isOriginal: true,
        }));

        setInitialValues({
          users:
            usersArray.length > 0
              ? usersArray
              : [{name: '', email: '', isOriginal: false}],
        });
      } catch (error) {
        console.error('Error loading linked users:', error);
        setInitialValues({users: [{name: '', email: '', isOriginal: false}]});
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  // Count how many original (fetched) users are in the current list
  const countOriginalUsersRemaining = users => {
    return users.filter(user => originalUserEmails.includes(user.email)).length;
  };

  // Format errors to display
  const getErrorMessage = (errors, touched, field, index) => {
    const fieldTouched = getIn(touched, `users[${index}].${field}`);
    const fieldError = getIn(errors, `users[${index}].${field}`);
    return fieldTouched && fieldError ? fieldError : null;
  };

  // Handle form submission
  const handleSubmit = async values => {
    try {
      // Format data for submission
      console.log(arr);
      const ci = await checkInternet();
      if (!ci) {
        return;
      }
      const formattedData = values.users.reduce((acc, user) => {
        acc[user.email] = {name: user.name, email: user.email};
        return acc;
      }, {});

      await saveLinkedUsers(formattedData);
      await saveLinkedUsersDB(formattedData);
      await deleteUsersInUsers(arr);
      // Navigate back
      navigation.goBack();
    } catch (error) {
      console.error('Submission error:', error);
      // Show error message
      Snackbar.show({
        text: 'Failed to update users',
        duration: Snackbar.LENGTH_SHORT,
      });
    }
  };

  const arr: string[] = [];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={24} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Manage Linked Users</Text>
          </View>

          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>Linked Users</Text>
            <Text style={styles.sectionDescription}>
              Manage users who have access to your restaurant profile
            </Text>

            {loading ? (
              <ActivityIndicator
                size="small"
                color="#0F766E"
                style={styles.loader}
              />
            ) : (
              <Formik
                initialValues={initialValues}
                validationSchema={userSchema}
                onSubmit={handleSubmit}
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
                  setFieldValue,
                }) => (
                  <>
                    <FieldArray name="users">
                      {({push, remove}) => (
                        <View style={styles.usersContainer}>
                          {values.users.map((user, index) => (
                            <View key={index} style={styles.userCard}>
                              <View style={styles.userInfo}>
                                <View style={styles.inputGroup}>
                                  <Text style={styles.inputLabel}>Name</Text>
                                  <TextInput
                                    style={[
                                      styles.textInput,
                                      getErrorMessage(
                                        errors,
                                        touched,
                                        'name',
                                        index,
                                      ) && styles.inputError,
                                    ]}
                                    value={user.name}
                                    onChangeText={value =>
                                      setFieldValue(
                                        `users[${index}].name`,
                                        value,
                                      )
                                    }
                                    onBlur={handleBlur(`users[${index}].name`)}
                                    placeholder="Enter name"
                                    placeholderTextColor="#94A3B8"
                                  />
                                  {getErrorMessage(
                                    errors,
                                    touched,
                                    'name',
                                    index,
                                  ) && (
                                    <Text style={styles.errorText}>
                                      {getErrorMessage(
                                        errors,
                                        touched,
                                        'name',
                                        index,
                                      )}
                                    </Text>
                                  )}
                                </View>

                                <View style={styles.inputGroup}>
                                  <Text style={styles.inputLabel}>Email</Text>
                                  <TextInput
                                    style={[
                                      styles.textInput,
                                      getErrorMessage(
                                        errors,
                                        touched,
                                        'email',
                                        index,
                                      ) && styles.inputError,
                                      user.isOriginal && styles.disabledInput,
                                    ]}
                                    value={user.email}
                                    onChangeText={value =>
                                      setFieldValue(
                                        `users[${index}].email`,
                                        value,
                                      )
                                    }
                                    onBlur={handleBlur(`users[${index}].email`)}
                                    placeholder="Enter email"
                                    placeholderTextColor="#94A3B8"
                                    editable={!user.isOriginal}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                  />
                                  {getErrorMessage(
                                    errors,
                                    touched,
                                    'email',
                                    index,
                                  ) && (
                                    <Text style={styles.errorText}>
                                      {getErrorMessage(
                                        errors,
                                        touched,
                                        'email',
                                        index,
                                      )}
                                    </Text>
                                  )}
                                </View>
                              </View>

                              <TouchableOpacity
                                style={[
                                  styles.deleteButton,
                                  (values.users.length <= 1 ||
                                    (user.isOriginal &&
                                      countOriginalUsersRemaining(
                                        values.users,
                                      ) <= 1)) &&
                                    styles.disabledButton,
                                ]}
                                onPress={() => {
                                  if (
                                    user.isOriginal &&
                                    countOriginalUsersRemaining(values.users) <=
                                      1
                                  ) {
                                    Snackbar.show({
                                      text: 'At least one original user must remain',
                                      duration: Snackbar.LENGTH_SHORT,
                                    });
                                  } else if (values.users.length > 1) {
                                    if (user.isOriginal) {
                                      arr.push(user.email);
                                    }
                                    remove(index);
                                    Snackbar.show({
                                      text: 'User deleted',
                                      duration: Snackbar.LENGTH_LONG,
                                      action: {
                                        text: 'OK',
                                        textColor: '#0F766E',
                                      },
                                    });
                                  }
                                }}
                                disabled={
                                  values.users.length <= 1 ||
                                  (user.isOriginal &&
                                    countOriginalUsersRemaining(values.users) <=
                                      1)
                                }>
                                <Ionicons
                                  name="trash-outline"
                                  size={24}
                                  color={
                                    values.users.length <= 1 ||
                                    (user.isOriginal &&
                                      countOriginalUsersRemaining(
                                        values.users,
                                      ) <= 1)
                                      ? '#94A3B8'
                                      : '#EF4444'
                                  }
                                />
                              </TouchableOpacity>
                            </View>
                          ))}

                          <View style={styles.actionsContainer}>
                            <TouchableOpacity
                              style={styles.addButton}
                              onPress={() =>
                                push({name: '', email: '', isOriginal: false})
                              }>
                              <Icon
                                name="plus"
                                size={20}
                                color="#0F766E"
                                style={styles.buttonIcon}
                              />
                              <Text style={styles.addButtonText}>
                                Add New User
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={[
                                styles.submitButton,
                                (!isValid || isSubmitting) &&
                                  styles.disabledButton,
                              ]}
                              disabled={!isValid || isSubmitting}
                              onPress={handleSubmit}>
                              <Icon
                                name="save"
                                size={20}
                                color="#fff"
                                style={styles.buttonIcon}
                              />
                              <Text style={styles.submitButtonText}>
                                Save User Details
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}
                    </FieldArray>
                  </>
                )}
              </Formik>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
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
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
  },
  loader: {
    padding: 20,
  },
  usersContainer: {
    marginBottom: 20,
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 12,
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
  disabledInput: {
    backgroundColor: '#E2E8F0',
    color: '#64748B',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  disabledButton: {
    opacity: 0.5,
  },
  actionsContainer: {
    marginTop: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#0F766E',
    borderRadius: 12,
    marginBottom: 12,
  },
  addButtonText: {
    color: '#0F766E',
    fontSize: 16,
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: '#0F766E',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonIcon: {
    marginRight: 8,
  },
});

export default LinkedUsersScreen;
