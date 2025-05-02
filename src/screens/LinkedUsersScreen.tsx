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
import Snackbar from 'react-native-snackbar';
import {emailExists} from '../services/databaseManager';
import { fetchLinkedUsers, saveLinkedUsers } from '../services/storageService';

// Validation schema
const userSchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: Yup.string()
    .email('Invalid email')
    .required('Email is required')
    .matches(/@gmail\.com$/, 'Email must a Gmail')
    .test(
      'email-already-registered',
      'Email id is already registered',
      async email => {
        if (!email) return true;
        const isExists = await emailExists(email);
        if (isExists) {
          return false;
        }
        return true;
      },
    ),
});

const LinkedUsersScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [errors, setErrors] = useState({});
  const [showSnackbar, setShowSnackbar] = useState(false);

  // Track which users were originally loaded (from the database)
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
            marginHorizontal: 10,
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

        // Convert object to array for easier manipulation
        const usersArray = Object.values(linkedUsers);
        setUsers(usersArray);
      } catch (error) {
        console.error('Error loading linked users:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  // Handle adding a new user
  const handleAddUser = () => {
    setUsers([...users, {name: '', email: ''}]);
  };

  // Handle input changes
  const handleInputChange = (index, field, value) => {
    const updatedUsers = [...users];
    updatedUsers[index] = {...updatedUsers[index], [field]: value};
    setUsers(updatedUsers);

    // Validate on change
    validateField(index, field, value);
  };

  // Validate a single field
  const validateField = async (index, field, value) => {
    try {
      // Create a test object with just the field being validated
      const testObj = {[field]: value};

      // Validate just that field against the schema
      await Yup.reach(userSchema, field).validate(value);

      // Clear error for this field if validation passes
      setErrors(prev => ({
        ...prev,
        [`${index}-${field}`]: null,
      }));
    } catch (error) {
      // Set error message for this field
      setErrors(prev => ({
        ...prev,
        [`${index}-${field}`]: error.message,
      }));
    }
  };

  // Check if form has any errors
  const hasErrors = () => {
    // Check for any validation errors
    if (Object.values(errors).some(error => error)) return true;

    // Check for empty required fields
    return users.some(user => !user.name || !user.email);
  };

  // Count how many original (fetched) users are in the current list
  const countOriginalUsersRemaining = () => {
    return users.filter(user => originalUserEmails.includes(user.email)).length;
  };

  // Handle user deletion
  const handleDeleteUser = index => {
    const userToDelete = users[index];
    const isOriginalUser = originalUserEmails.includes(userToDelete.email);

    if (isOriginalUser && countOriginalUsersRemaining() <= 1) {
      Snackbar.show({
        text: 'At least one original user must remain',
        duration: Snackbar.LENGTH_SHORT,
      });
      return;
    }

    const updatedUsers = [...users];
    updatedUsers.splice(index, 1);

    setUsers(updatedUsers);

    Snackbar.show({
      text: 'User deleted',
      duration: Snackbar.LENGTH_LONG,
      action: {
        text: 'OK',
        textColor: '#0F766E',
      },
    });
  };


  // Handle form submission
  const handleSubmit = async () => {
    try {
      // Format data for submission
      const formattedData = users.reduce((acc, user) => {
        acc[user.email] = {name: user.name, email: user.email};
        return acc;
      }, {});
      console.log(formattedData)
      await saveLinkedUsers(formattedData as LinkedUsers);

      // Show success message
      Snackbar.show({
        text: 'Users updated successfully',
        duration: Snackbar.LENGTH_SHORT,
      });

      // Navigate back
      navigation.goBack();
    } catch (error) {
      console.error('Validation error:', error);
      // Show error message
      Snackbar.show({
        text: 'Please fix validation errors',
        duration: Snackbar.LENGTH_SHORT,
      });
    }
  };

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
              <View style={styles.usersContainer}>
                {users.map((user, index) => (
                  <View key={index} style={styles.userCard}>
                    <View style={styles.userInfo}>
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Name</Text>
                        <TextInput
                          style={[
                            styles.textInput,
                            errors[`${index}-name`] && styles.inputError,
                          ]}
                          value={user.name}
                          onChangeText={value =>
                            handleInputChange(index, 'name', value)
                          }
                          placeholder="Enter name"
                          placeholderTextColor="#94A3B8"
                        />
                        {errors[`${index}-name`] && (
                          <Text style={styles.errorText}>
                            {errors[`${index}-name`]}
                          </Text>
                        )}
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Email</Text>
                        <TextInput
                          style={[
                            styles.textInput,
                            errors[`${index}-email`] && styles.inputError,
                            // For existing users (fetched ones), email is not editable
                            originalUserEmails.includes(user.email) &&
                              styles.disabledInput,
                          ]}
                          value={user.email}
                          onChangeText={value =>
                            handleInputChange(index, 'email', value)
                          }
                          placeholder="Enter email"
                          placeholderTextColor="#94A3B8"
                          editable={!originalUserEmails.includes(user.email)} // Only new users can edit email
                          keyboardType="email-address"
                          autoCapitalize="none"
                        />
                        {errors[`${index}-email`] && (
                          <Text style={styles.errorText}>
                            {errors[`${index}-email`]}
                          </Text>
                        )}
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.deleteButton,
                        users.length <= 1 && styles.disabledButton,
                      ]}
                      onPress={() => handleDeleteUser(index)}
                      disabled={users.length <= 1}>
                      <Ionicons
                        name="trash-outline"
                        size={24}
                        color={users.length <= 1 ? '#94A3B8' : '#EF4444'}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {!loading && (
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleAddUser}>
                  <Icon
                    name="plus"
                    size={20}
                    color="#0F766E"
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.addButtonText}>Add New User</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    hasErrors() && styles.disabledButton,
                  ]}
                  disabled={hasErrors()}
                  onPress={handleSubmit}>
                  <Icon
                    name="save"
                    size={20}
                    color="#fff"
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.submitButtonText}>Save User Details</Text>
                </TouchableOpacity>
              </View>
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
