import React, {useState, useEffect} from 'react';
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
  Alert,
} from 'react-native';
import {TextInput, HelperText, Divider} from 'react-native-paper';
import Icon from 'react-native-vector-icons/Feather';
import * as Yup from 'yup';
import {Formik} from 'formik';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Validation schema - dynamically validate all nested fields
const MenuEditSchema = Yup.object().shape({
  menu: Yup.lazy(obj => {
    const categorySchema = {};

    // Create schema for each category
    Object.keys(obj || {}).forEach(categoryKey => {
      const dishSchema = {};

      // Create schema for each dish in the category
      Object.keys(obj[categoryKey] || {}).forEach(dishKey => {
        dishSchema[dishKey] = Yup.object().shape({
          name: Yup.string()
            .required('Dish name is required')
            .test(
              'unique-dish-name-category',
              'Dish name already exists in this category',
              function (dishName) {
                if (!dishName) return true;

                if (dishKey === dishName) {
                  return true;
                }

                const category = obj[categoryKey];
                return !Object.keys(category).some(
                  otherDishKey =>
                    otherDishKey !== dishKey &&
                    category[otherDishKey].name === dishName,
                );
              },
            )
            .test(
              'unique-dish-name',
              'You have already added this dish manually',
              async function (dishName) {
                if (!dishName) return true;
                try {
                  const data = await AsyncStorage.getItem('menu');
                  if (!data) return true;
                  const menu = JSON.parse(data);
                  if (menu[categoryKey] && menu[categoryKey][dishName]) {
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
            // .positive('Price must be positive')
            .max(10000, 'Price cannot exceed 10000')
            .required('Price is required'),
        });
      });

      // Add category validation - object with dish schemas
      categorySchema[categoryKey] = Yup.object().shape(dishSchema);
    });

    return Yup.object().shape(categorySchema);
  }),
  categoryNames: Yup.object()
    .shape({})
    .test('category-names-validation', null, function (categoryNames) {
      const errors = {};
      let hasErrors = false;

      Object.keys(categoryNames || {}).forEach(key => {
        const name = categoryNames[key];
        if (!name || name.trim() === '') {
          errors[key] = 'Category name is required';
          hasErrors = true;
        } else {
          // Check for duplicate category names
          const duplicateKey = Object.keys(categoryNames).find(
            k => k !== key && categoryNames[k] === name,
          );
          if (duplicateKey) {
            errors[key] = 'Category name already exists';
            hasErrors = true;
          }
        }
      });

      return hasErrors
        ? this.createError({
            path: 'categoryNames',
            message: JSON.stringify(errors),
          })
        : true;
    }),
});

// Price input formatter - keep for validation logic
const validatePriceInput = value => {
  // Allow digits and up to two decimal places
  return /^\d+(\.\d{0,2})?$/.test(value);
};

const MenuEditScreen = ({route, navigation}) => {
  // Extract the menu data from route params or use a default empty menu
  const initialMenuData = route.params?.menuData || {menu: {}};
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const parent = navigation.getParent(); // Get Tab Navigator
    if (parent) {
      parent.setOptions({
        tabBarStyle: {display: 'none'},
      });
    }

    return () => {
      if (parent) {
        parent.setOptions({
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
            marginHorizontal: 30,
            ...styles.shadow,
          },
        });
      }
    };
  }, [navigation]);

  // Initialize category names from initial menu data
  const getInitialCategoryNames = () => {
    const names = {};
    Object.keys(initialMenuData.menu || {}).forEach(key => {
      names[key] = key;
    });
    return names;
  };

  // Function to handle dish deletion
  const handleDeleteDish = (setFieldValue, values, categoryKey, dishKey) => {
    const updatedMenu = {...values.menu};
    const category = updatedMenu[categoryKey];

    // Delete the dish
    delete category[dishKey];

    // If category has no items left, remove the category
    if (Object.keys(category).length === 0) {
      delete updatedMenu[categoryKey];

      // Also remove from categoryNames
      const updatedCategoryNames = {...values.categoryNames};
      delete updatedCategoryNames[categoryKey];
      setFieldValue('categoryNames', updatedCategoryNames);
    }

    // Update Formik state
    setFieldValue('menu', updatedMenu);
  };

  // Function to handle category rename
  const handleCategoryRename = (
    setFieldValue,
    values,
    oldCategoryKey,
    newCategoryName,
  ) => {
    if (oldCategoryKey === newCategoryName) return;

    const updatedMenu = {...values.menu};

    // Create new category with new name and copy all dishes
    updatedMenu[newCategoryName] = {...updatedMenu[oldCategoryKey]};

    // Delete old category
    delete updatedMenu[oldCategoryKey];

    // Update Formik state
    setFieldValue('menu', updatedMenu);

    // Update category names - remove the old key
    const updatedCategoryNames = {...values.categoryNames};
    delete updatedCategoryNames[oldCategoryKey];
    updatedCategoryNames[newCategoryName] = newCategoryName;
    setFieldValue('categoryNames', updatedCategoryNames);
  };

  // Handle form submission
  const handleFormSubmit = async values => {
    setIsSubmitting(true);
    try {
      // Create a clean menu object without the categoryNames
      const menuToSubmit = {menu: values.menu};

      // Implementation for actual submission logic
      console.log('Form submitted with values:', menuToSubmit);
      Alert.alert('Success', 'Menu updated successfully');
    } catch (error) {
      console.error('Error updating menu:', error);
      Alert.alert('Error', 'Failed to update menu');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (Object.keys(initialMenuData.menu).length === 0) {
    return (
      <>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Menu</Text>
        </View>
        
        <View style={styles.emptyState}>
          <Icon name="menu" size={48} color="#94A3B8" />
          <Text style={styles.emptyStateText}>
            No menu items found {'\n'}It seems that the picture you uploaded is
            not a menu.
            {'\n'}Please try again with a clearer image.
          </Text>
        </View>
      </>
    );

  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

          <KeyboardAvoidingView
            // behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
            >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Menu</Text>
        </View>

        <Formik
          initialValues={{
            ...initialMenuData,
            categoryNames: getInitialCategoryNames(),
          }}
          validationSchema={MenuEditSchema}
          validateOnChange={true}
          validateOnBlur={true}
          onSubmit={handleFormSubmit}>
          {({
            values,
            errors,
            touched,
            handleSubmit,
            isValid,
            setFieldValue,
            handleBlur,
            setFieldTouched,
          }) => {
            // Parse category name errors from JSON string if they exist
            let categoryNameErrors = {};
            if (
              errors.categoryNames &&
              typeof errors.categoryNames === 'string'
            ) {
              try {
                categoryNameErrors = JSON.parse(errors.categoryNames);
              } catch (e) {
                console.error('Error parsing category name errors:', e);
              }
            }

            return (
              <>
                <ScrollView
                  style={styles.formContainer}
                  keyboardShouldPersistTaps="handled">
                  {
                  
                    Object.keys(values.menu).map(categoryKey => {
                      const category = values.menu[categoryKey];
                      const categoryNameError = categoryNameErrors[categoryKey];
                      const isCategoryTouched =
                        touched.categoryNames?.[categoryKey];

                      return (
                        <View
                          key={`category-${categoryKey}`}
                          style={styles.categoryContainer}>
                          <View style={styles.categoryTitleContainer}>
                            <TextInput
                              mode="outlined"
                              style={styles.categoryNameInput}
                              value={values.categoryNames[categoryKey] || ''}
                              onChangeText={text => {
                                setFieldValue(
                                  `categoryNames.${categoryKey}`,
                                  text,
                                );
                              }}
                              onBlur={() => {
                                setFieldTouched(
                                  `categoryNames.${categoryKey}`,
                                  true,
                                );

                                // Only rename category if validation passes
                                const newName =
                                  values.categoryNames[categoryKey];
                                if (
                                  newName &&
                                  newName.trim() !== '' &&
                                  newName !== categoryKey
                                ) {
                                  handleCategoryRename(
                                    setFieldValue,
                                    values,
                                    categoryKey,
                                    newName.trim(),
                                  );
                                }
                              }}
                              error={isCategoryTouched && !!categoryNameError}
                              outlineStyle={styles.categoryInputOutline}
                              theme={{
                                colors: {
                                  primary: '#0F766E',
                                  text: '#0F172A',
                                  error: '#DC2626',
                                },
                              }}
                              textColor="#0F172A"
                              left={
                                <TextInput.Icon
                                  icon="tag-outline"
                                  size={20}
                                  color="#64748B"
                                />
                              }
                            />
                            {isCategoryTouched && categoryNameError && (
                              <HelperText
                                type="error"
                                visible={true}
                                style={styles.errorText}>
                                {categoryNameError}
                              </HelperText>
                            )}
                          </View>

                          {Object.keys(category).map(dishKey => {
                            const dish = category[dishKey];
                            const dishNamePath = `menu.${categoryKey}.${dishKey}.name`;
                            const dishPricePath = `menu.${categoryKey}.${dishKey}.price`;
                            const hasNameError =
                              // touched.menu?.[categoryKey]?.[dishKey]?.name &&
                              errors.menu?.[categoryKey]?.[dishKey]?.name;
                            const hasPriceError =
                              // touched.menu?.[categoryKey]?.[dishKey]?.price &&
                              errors.menu?.[categoryKey]?.[dishKey]?.price;

                            return (
                              <View
                                key={`dish-${dishKey}`}
                                style={styles.dishItem}>
                                <View style={styles.dishInputContainer}>
                                  <TextInput
                                    mode="outlined"
                                    style={styles.dishNameInput}
                                    value={dish.name}
                                    onChangeText={value =>
                                      setFieldValue(dishNamePath, value)
                                    }
                                    onBlur={() => handleBlur(dishNamePath)}
                                    error={hasNameError}
                                    outlineStyle={styles.inputOutline}
                                    theme={{
                                      colors: {
                                        primary: '#0F766E',
                                        text: '#0F172A',
                                        error: '#DC2626',
                                      },
                                    }}
                                    textColor="#0F172A"
                                    placeholder="Dish name"
                                  />

                                  <TextInput
                                    mode="outlined"
                                    style={styles.dishPriceInput}
                                    value={
                                      dish.price !== undefined
                                        ? String(dish.price)
                                        : ''
                                    }
                                    keyboardType="numeric"
                                    onChangeText={value => {
                                      if (
                                        value === '' ||
                                        validatePriceInput(value)
                                      ) {
                                        const numValue =
                                          value === '' ? '' : parseFloat(value);
                                        setFieldValue(dishPricePath, numValue);
                                      }
                                    }}
                                    onBlur={() => handleBlur(dishPricePath)}
                                    error={hasPriceError}
                                    outlineStyle={styles.inputOutline}
                                    theme={{
                                      colors: {
                                        primary: '#0F766E',
                                        text: '#0F172A',
                                        error: '#DC2626',
                                      },
                                    }}
                                    textColor="#0F172A"
                                    placeholder="Price"
                                    left={
                                      <TextInput.Icon
                                        icon="currency-inr"
                                        size={18}
                                        color="#64748B"
                                      />
                                    }
                                  />

                                  <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => {
                                      Alert.alert(
                                        'Delete Dish',
                                        `Are you sure you want to delete "${dish.name}" ?`,
                                        [
                                          {
                                            text: 'Cancel',
                                            style: 'cancel',
                                          },
                                          {
                                            text: 'Delete',
                                            onPress: () =>
                                              handleDeleteDish(
                                                setFieldValue,
                                                values,
                                                categoryKey,
                                                dishKey,
                                              ),
                                            style: 'destructive',
                                          },
                                        ],
                                      );
                                    }}>
                                    <Icon
                                      name="trash-2"
                                      size={18}
                                      color="#DC2626"
                                    />
                                  </TouchableOpacity>
                                </View>

                                {hasNameError && (
                                  <HelperText
                                    type="error"
                                    visible={true}
                                    style={styles.errorText}>
                                    {
                                      errors.menu?.[categoryKey]?.[dishKey]
                                        ?.name
                                    }
                                  </HelperText>
                                )}

                                {hasPriceError && (
                                  <HelperText
                                    type="error"
                                    visible={true}
                                    style={styles.errorText}>
                                    {
                                      errors.menu?.[categoryKey]?.[dishKey]
                                        ?.price
                                    }
                                  </HelperText>
                                )}
                              </View>
                            );
                          })}

                          <Divider style={styles.divider} />
                        </View>
                      );
                    })
                  }

                  <View style={styles.footerContainer}>
                    <Icon name="info" size={16} color="#64748B" />
                    <Text style={styles.policyText}>
                      Please review all menu items before saving.
                      {'\n'}AI can make mistakes.
                    </Text>
                  </View>
                </ScrollView>

                <View style={styles.bottomContainer}>
                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      (!isValid || isSubmitting) && styles.disabledButton,
                    ]}
                    disabled={!isValid || isSubmitting}
                    onPress={handleSubmit}>
                    {isSubmitting ? (
                      <Text style={styles.submitButtonText}>
                        Saving Changes...
                      </Text>
                    ) : (
                      <>
                        <Icon
                          name="save"
                          size={20}
                          color="#fff"
                          style={styles.buttonIcon}
                        />
                        <Text style={styles.submitButtonText}>Save Menu</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            );
          }}
        </Formik>
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
    flex: 1,
    padding: 20,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryTitleContainer: {
    marginBottom: 12,
  },
  categoryNameInput: {
    backgroundColor: '#FFFFFF',
    height: 48,
    fontSize: 18,
    fontWeight: '600',
  },
  categoryInputOutline: {
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#F1F5F9',
  },
  dishItem: {
    marginBottom: 12,
  },
  dishInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dishNameInput: {
    flex: 7,
    backgroundColor: '#FFFFFF',
    height: 50,
    marginRight: 8,
  },
  dishPriceInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    height: 50,
    minWidth: 90,
  },
  inputOutline: {
    borderRadius: 8,
    borderWidth: 1,
  },
  deleteButton: {
    padding: 12,
    marginLeft: 8,
  },
  errorText: {
    color: '#DC2626',
    paddingLeft: 0,
    fontSize: 14,
  },
  divider: {
    marginTop: 4,
    marginBottom: 4,
    backgroundColor: '#E2E8F0',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 12,
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  policyText: {
    marginLeft: 8,
    color: '#64748B',
    fontSize: 14,
    flexShrink: 1,
  },
  bottomContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  submitButton: {
    backgroundColor: '#0F766E',
    borderRadius: 12,
    paddingVertical: 16,
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

export default MenuEditScreen;
