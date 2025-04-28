import React, {useEffect, useRef, useState} from 'react';
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
} from 'react-native';
import {TextInput, Button, HelperText} from 'react-native-paper';
import Icon from 'react-native-vector-icons/Feather';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {userProps} from '../App'; // Import userProps from App.tsx
import { useNavigation } from '@react-navigation/native';
import { addNewDish, categoryExists, dishExists } from '../components/databaseManager';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Transform your schema to use async validation
const AddDishSchema = Yup.object().shape({
  dishName: Yup.string()
    .required('Dish name is required')
    .test(
      'unique-dish-name',
      'Dish name already exists in this category',
      async function (dishName) {
        if (!dishName) return true;
        try {
          const category = this.parent.category;
          const data = await AsyncStorage.getItem('menu');
          if(!data) return true;
          const menu = JSON.parse(data);
          if (menu[category] && menu[category][dishName] ) {
            return false;
          }
          return true;
        } catch (error) {
          console.error('Error checking dish name:', error);
          return false;
        }
      },
    ),
  price: Yup.number()
    .typeError('Price must be a number')
    .positive('Price must be a positive number')
    .integer('Price must be an integer')
    .required('Price is required'),
  category: Yup.string()
    .required('Category is required')
});


const AddDishScreen = ({
  route,
  navigation,
}: {
  route: {params: userProps & {category: string, addDishInMenu:Function}};
  navigation: any;
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dishNameInputRef = useRef<any>(null);
  const user = route.params;
  const initialCategory = route.params.category;
  const addDishInMenu = route.params.addDishInMenu;
  
  const isNewCategory = initialCategory === null ? true : false;

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
          ...styles.shadow,
        },
      });
    };
  }, [navigation]);

  // useEffect(() => {
  //   // Focus on the dish name input when the component mounts
  //   setTimeout(() => {
  //     if (dishNameInputRef.current) {
  //       dishNameInputRef.current.focus();
  //     }
  //   }, 100);
  // }, []);

  const handleFormSubmit = async (values: any) => {
    setIsSubmitting(true);
    
    try {
      addNewDish(values.category, values.dishName, values.price);
      addDishInMenu(values.category, values.dishName, values.price);
      navigation.goBack();
    } catch (error) {
      console.error('Error adding dish:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Dish</Text>
        </View>

        <ScrollView
          style={styles.formContainer}
          keyboardShouldPersistTaps="handled">
          <Formik
            initialValues={{dishName: '', price: '', category: initialCategory}}
            validationSchema={AddDishSchema}
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
                  <Text style={styles.inputLabel}>Category</Text>
                  <TextInput
                    mode="outlined"
                    style={styles.input}
                    value={values.category}
                    disabled={!isNewCategory}
                    onChangeText={handleChange('category')}
                    onBlur={handleBlur('category')}
                    error={!!(touched.category && errors.category)}
                    outlineStyle={styles.inputOutline}
                    theme={{colors: {primary: '#0F766E', text: '#0F172A'}}}
                    left={<TextInput.Icon icon="tag-outline" color="#64748B" />}
                    textColor="#0F172A"
                  />
                  {touched.category && errors.category && (
                    <HelperText
                      type="error"
                      visible={true}
                      style={styles.errorText}>
                      {errors.category}
                    </HelperText>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Dish Name</Text>
                  <TextInput
                    mode="outlined"
                    style={styles.input}
                    value={values.dishName}
                    onChangeText={handleChange('dishName')}
                    onBlur={handleBlur('dishName')}
                    error={!!(touched.dishName && errors.dishName)}
                    ref={dishNameInputRef}
                    outlineStyle={styles.inputOutline}
                    theme={{colors: {primary: '#0F766E', text: '#0F172A'}}}
                    left={<TextInput.Icon icon="food" color="#64748B" />}
                    textColor="#0F172A"
                  />
                  {touched.dishName && errors.dishName && (
                    <HelperText
                      type="error"
                      visible={true}
                      style={styles.errorText}>
                      {errors.dishName}
                    </HelperText>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Price (₹)</Text>
                  <TextInput
                    mode="outlined"
                    style={styles.input}
                    value={values.price}
                    onChangeText={handleChange('price')}
                    onBlur={handleBlur('price')}
                    error={!!(touched.price && errors.price)}
                    keyboardType="numeric"
                    outlineStyle={styles.inputOutline}
                    theme={{colors: {primary: '#0F766E', text: '#0F172A'}}}
                    left={
                      <TextInput.Icon icon="currency-inr" color="#64748B" />
                    }
                    textColor="#0F172A"
                  />
                  {touched.price && errors.price && (
                    <HelperText
                      type="error"
                      visible={true}
                      style={styles.errorText}>
                      {errors.price}
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
                    <Text style={styles.submitButtonText}>Adding Dish...</Text>
                  ) : (
                    <>
                      <Icon
                        name="plus-circle"
                        size={20}
                        color="#fff"
                        style={styles.buttonIcon}
                      />
                      <Text style={styles.submitButtonText}>Add Dish</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}
          </Formik>

          <View style={styles.footerContainer}>
            <Icon name="info" size={16} color="#64748B" />
            <Text style={styles.policyText}>
              By adding a dish, you confirm that the information is accurate.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default AddDishScreen;
