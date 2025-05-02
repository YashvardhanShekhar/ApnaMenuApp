import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import {TextInput, HelperText} from 'react-native-paper';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {useNavigation} from '@react-navigation/native';
import {saveProfileInfoDB} from '../services/databaseManager';
import {fetchProfileInfo, saveProfileInfo} from '../services/storageService';
import Icon from 'react-native-vector-icons/Feather';

const ProfileSchema = Yup.object().shape({
  phoneNumber: Yup.string()
    .matches(/^[0-9+\s-]+$/, 'Invalid phone number format')
    .length(10, 'Phone number must be exactly 10 digits'),
  address: Yup.string().min(5, 'Address is too short'),
  description: Yup.string()
    .min(10, 'Description must be at least 10 characters')
    .max(200, 'Description cannot exceed 200 characters'),
});

const EditInfo = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [descHeight, setDescHeight] = useState(100);

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

  useEffect(() => {
    const loadProfileData = async () => {
      const info = await fetchProfileInfo();
      if (info) setProfileData(info);
    };
    loadProfileData();
  }, []);

  const handleSave = async values => {
    setLoading(true);
    const info = {
      phoneNumber: values.phoneNumber || null,
      address: values.address || null,
      description: values.description || null,
    };
    await saveProfileInfo(info);
    await saveProfileInfoDB(info);
    setLoading(false);
    navigation.goBack();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Info</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.formContainer}
          keyboardShouldPersistTaps="handled">
          <Formik
            enableReinitialize
            initialValues={{
              phoneNumber: profileData?.phoneNumber || '',
              address: profileData?.address || '',
              description: profileData?.description || '',
            }}
            validationSchema={ProfileSchema}
            onSubmit={handleSave}>
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              isValid,
            }) => (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <TextInput
                    mode="outlined"
                    style={styles.input}
                    value={values.phoneNumber}
                    onChangeText={handleChange('phoneNumber')}
                    onBlur={handleBlur('phoneNumber')}
                    placeholder="Add your number"
                    placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad"
                    error={!!(touched.phoneNumber && errors.phoneNumber)}
                    outlineStyle={styles.inputOutline}
                    theme={{colors: {primary: '#0F766E', text: '#0F172A'}}}
                    left={
                      <TextInput.Icon icon="phone-outline" color="#64748B" />
                    }
                    textColor="#0F172A"
                  />
                  {touched.phoneNumber && errors.phoneNumber && (
                    <HelperText type="error" visible style={styles.errorText}>
                      {errors.phoneNumber}
                    </HelperText>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Address</Text>
                  <TextInput
                    mode="outlined"
                    style={styles.input}
                    value={values.address}
                    onChangeText={handleChange('address')}
                    onBlur={handleBlur('address')}
                    placeholder="Address of your restaurant"
                    placeholderTextColor="#94A3B8"
                    error={!!(touched.address && errors.address)}
                    outlineStyle={styles.inputOutline}
                    theme={{colors: {primary: '#0F766E', text: '#0F172A'}}}
                    left={
                      <TextInput.Icon
                        icon="map-marker-outline"
                        color="#64748B"
                      />
                    }
                    textColor="#0F172A"
                  />
                  {touched.address && errors.address && (
                    <HelperText type="error" visible style={styles.errorText}>
                      {errors.address}
                    </HelperText>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Description</Text>
                  <TextInput
                    mode="outlined"
                    style={[styles.input, {minHeight: 100, height: descHeight}]}
                    value={values.description}
                    onChangeText={handleChange('description')}
                    onBlur={handleBlur('description')}
                    placeholder="tell us about your restaurant"
                    placeholderTextColor="#94A3B8"
                    multiline
                    onContentSizeChange={e =>
                      setDescHeight(e.nativeEvent.contentSize.height + 20)
                    }
                    error={!!(touched.description && errors.description)}
                    outlineStyle={styles.inputOutline}
                    theme={{colors: {primary: '#0F766E', text: '#0F172A'}}}
                    left={<TextInput.Icon icon="text" color="#64748B" />}
                    textColor="#0F172A"
                  />

                  {touched.description && errors.description && (
                    <HelperText type="error" visible style={styles.errorText}>
                      {errors.description}
                    </HelperText>
                  )}
                </View>

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    (!isValid || loading) && styles.disabledButton,
                  ]}
                  onPress={handleSubmit}
                  disabled={!isValid || loading}>
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Icon
                        name="save"
                        size={20}
                        color="#fff"
                        style={styles.buttonIcon}
                      />
                      <Text style={styles.submitButtonText}>Save Info</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}
          </Formik>

          <View style={styles.footerContainer}>
            <Icon name="info" size={16} color="#64748B" />
            <Text style={styles.policyText}>
              Make sure your profile info is up to date and correct.
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
    paddingBottom: 40,
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
  },
  policyText: {
    marginLeft: 8,
    color: '#64748B',
    fontSize: 14,
    flexShrink: 1,
  },
});

export default EditInfo;
