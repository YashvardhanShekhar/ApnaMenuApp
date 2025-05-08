// import React, {useState, useEffect} from 'react';
// import {
//   StyleSheet,
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ActivityIndicator,
//   ScrollView,
//   Modal,
//   Alert,
// } from 'react-native';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import {emailExists, saveProfileInfo} from '../services/databaseManager';
// import * as Yup from 'yup';
// import {Formik} from 'formik';

// const NewUserSchema = Yup.object().shape({
//   name: Yup.string()
//     .required('Name is required')
//     .min(2, 'Name must be at least 2 characters'),
//   email: Yup.string()
//     .email('Invalid email format')
//     .required('Email is required')
//     .test('unique-email', 'This email is already registered', function (email) {
//       return emailExists(email);
//     }),
// });

// const EditableProfileFields = () => {
//   const [profileData, setProfileData] = useState({
//     phoneNumber: '',
//     address: '',
//     description: '',
//   });

//   const [editing, setEditing] = useState({
//     phoneNumber: false,
//     address: false,
//     description: false,
//   });

//   const [tempValues, setTempValues] = useState({
//     phoneNumber: '84646884648684',
//     address: '864846684684864846',
//     description: '846846864 8846846 84648468',
//   });

//   const [saving, setSaving] = useState({
//     phoneNumber: false,
//     address: false,
//     description: false,
//   });

//   // State for the linked users
//   const [linkedUsers, setLinkedUsers] = useState({});

//   // State for handling modal visibility
//   const [modalVisible, setModalVisible] = useState(false);

//   // State for delete confirmation modal
//   const [deleteModalVisible, setDeleteModalVisible] = useState(false);
//   const [userToDelete, setUserToDelete] = useState(null);

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         // Load profile info
//         const storedData = await AsyncStorage.getItem('info');
//         if (storedData) {
//           setProfileData(JSON.parse(storedData));
//         }

//         // Load linked users
//         const storedUsers = await AsyncStorage.getItem('userLinked');
//         if (storedUsers) {
//           setLinkedUsers(JSON.parse(storedUsers));
//         } else {
//           const defaultUsers = {};
//           setLinkedUsers(defaultUsers);
//           await AsyncStorage.setItem(
//             'linkedUsers',
//             JSON.stringify(defaultUsers),
//           );
//         }
//       } catch (error) {
//         console.error('Error loading data:', error);
//       }
//     };

//     loadData();
//   }, []);

//   const handleEditPress = field => {
//     if (editing[field]) {
//       handleSave(field);
//     } else {
//       setEditing({...editing, [field]: true});
//       setTempValues({...tempValues, [field]: profileData[field]});
//     }
//   };

//   const handleInputChange = (field, value) => {
//     setTempValues({...tempValues, [field]: value});
//   };

//   const handleSave = async field => {
//     setSaving({...saving, [field]: true});
//     try {
//       const updatedData = {...profileData, [field]: tempValues[field]};
//       setProfileData(updatedData);

//       saveProfileInfo(updatedData);
//       await AsyncStorage.setItem('info', JSON.stringify(updatedData));

//       // Exit edit mode after saving
//       setEditing({...editing, [field]: false});
//     } catch (error) {
//       console.error(`Error saving ${field}:`, error);
//     } finally {
//       setSaving({...saving, [field]: false});
//     }
//   };

//   // Show delete confirmation modal
//   const confirmDeleteUser = email => {
//     setUserToDelete(email);
//     setDeleteModalVisible(true);
//   };

//   // Delete user function
//   const deleteUser = async () => {
//     if (!userToDelete) return;

//     try {
//       // Create a copy of the current users without the one to delete
//       const updatedUsers = {...linkedUsers};
//       delete updatedUsers[userToDelete];

//       // Update state
//       setLinkedUsers(updatedUsers);

//       // Save to AsyncStorage
//       await AsyncStorage.setItem('linkedUsers', JSON.stringify(updatedUsers));

//       // Close modal and reset user to delete
//       setDeleteModalVisible(false);
//       setUserToDelete(null);
//     } catch (error) {
//       console.error('Error deleting user:', error);
//       Alert.alert('Error', 'Failed to delete user. Please try again.');
//     }
//   };
//   let [info,setInfo] = useState()

//   useEffect(() => {
//     const fetchAdditionalInfo = async () => {
//       try {
//         const doc = await AsyncStorage.getItem('data');
//         const data = JSON.parse(doc);

//         if (data?.info) {
//           setInfo(data.info);
//         }
//       } catch (error) {
//         console.log('Error fetching info:', error);
//       }
//     };

//     fetchAdditionalInfo();
//   }, []);


//   return (
//     <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
//       <Text style={styles.sectionTitle}>Profile Information</Text>

//       <View style={{paddingHorizontal: 20, marginBottom: 20}}>
//         {info?.phoneNumber && info?.address && info?.description ? (
//           <>
//             <Text>📞 Phone: {info.phoneNumber}</Text>
//             <Text>🏠 Address: {info.address}</Text>
//             <Text>📝 Description: {info.description}</Text>
//           </>
//         ) : (
//           <Text style={{color: 'red'}} >
//             Please complete your profile details.
//           </Text>
//         )}
//       </View>

//       {/* Linked Users Section */}
//       <Text style={styles.sectionTitle}>Linked Users</Text>
//       <View style={styles.linkedUsersContainer}>
//         {Object.values(linkedUsers).map((user, index) => (
//           <View key={user.email} style={styles.userCard}>
//             <View style={styles.userInitial}>
//               <Text style={styles.initialText}>
//                 {user.name.charAt(0).toUpperCase()}
//               </Text>
//             </View>
//             <View style={styles.userInfo}>
//               <Text style={styles.userName}>{user.name}</Text>
//               <Text style={styles.userEmail}>{user.email}</Text>
//             </View>
//             <TouchableOpacity
//               style={styles.userAction}
//               onPress={() => confirmDeleteUser(user.email)}>
//               <Ionicons name="trash-outline" size={20} color="#FF5722" />
//             </TouchableOpacity>
//           </View>
//         ))}

//         {/* Add User Button */}
//         <TouchableOpacity
//           style={styles.addUserButton}
//           onPress={() => setModalVisible(true)}>
//           <Ionicons name="add-circle" size={24} color="#FF5722" />
//           <Text style={styles.addUserText}>Add New User</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Add User Modal with Formik */}
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={modalVisible}
//         onRequestClose={() => setModalVisible(false)}>
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Add New User</Text>
//               <TouchableOpacity onPress={() => setModalVisible(false)}>
//                 <Ionicons name="close" size={24} color="#333" />
//               </TouchableOpacity>
//             </View>

//             <Formik
//               initialValues={{name: '', email: ''}}
//               validationSchema={NewUserSchema}
//               validateOnBlur={true}
//               onSubmit={(values, {resetForm}) => {
//                 // Create updated users object
//                 const updatedUsers = {
//                   ...linkedUsers,
//                   [values.email]: {
//                     name: values.name,
//                     email: values.email,
//                   },
//                 };

//                 // Update state
//                 setLinkedUsers(updatedUsers);

//                 // Save to AsyncStorage
//                 AsyncStorage.setItem(
//                   'linkedUsers',
//                   JSON.stringify(updatedUsers),
//                 )
//                   .then(() => {
//                     // Reset form and close modal
//                     resetForm();
//                     setModalVisible(false);
//                   })
//                   .catch(error => {
//                     console.error('Error adding new user:', error);
//                     Alert.alert(
//                       'Error',
//                       'Failed to add new user. Please try again.',
//                     );
//                   });
//               }}
//               context={{linkedUsers}}>
//               {({
//                 handleChange,
//                 handleBlur,
//                 handleSubmit,
//                 values,
//                 errors,
//                 touched,
//                 isValid,
//                 isSubmitting,
//               }) => (
//                 <View style={styles.modalBody}>
//                   {/* Name Input */}
//                   <View style={styles.fieldContainer}>
//                     <Text style={styles.fieldLabel}>Name</Text>
//                     <View style={styles.inputContainer}>
//                       <TextInput
//                         style={styles.input}
//                         value={values.name}
//                         onChangeText={handleChange('name')}
//                         onBlur={handleBlur('name')}
//                         placeholder="Enter user's name"
//                       />
//                     </View>
//                     {touched.name && errors.name && (
//                       <Text style={styles.errorText}>{errors.name}</Text>
//                     )}
//                   </View>

//                   {/* Email Input */}
//                   <View style={styles.fieldContainer}>
//                     <Text style={styles.fieldLabel}>Email</Text>
//                     <View style={styles.inputContainer}>
//                       <TextInput
//                         style={styles.input}
//                         value={values.email}
//                         onChangeText={handleChange('email')}
//                         onBlur={handleBlur('email')}
//                         placeholder="Enter user's email"
//                         keyboardType="email-address"
//                         autoCapitalize="none"
//                       />
//                     </View>
//                     {touched.email && errors.email && (
//                       <Text style={styles.errorText}>{errors.email}</Text>
//                     )}
//                   </View>

//                   {/* Action Buttons */}
//                   <View style={styles.modalActions}>
//                     <TouchableOpacity
//                       style={[styles.modalButton, styles.cancelButton]}
//                       onPress={() => setModalVisible(false)}>
//                       <Text style={styles.cancelButtonText}>Cancel</Text>
//                     </TouchableOpacity>

//                     <TouchableOpacity
//                       style={[
//                         styles.modalButton,
//                         styles.addButton,
//                         (!isValid || isSubmitting) && styles.disabledButton,
//                       ]}
//                       disabled={!isValid || isSubmitting}
//                       onPress={() => handleSubmit}>
//                       <Text style={styles.addButtonText}>
//                         {isSubmitting ? 'Adding...' : 'Add User'}
//                       </Text>
//                     </TouchableOpacity>
//                   </View>
//                 </View>
//               )}
//             </Formik>
//           </View>
//         </View>
//       </Modal>

//       {/* Delete Confirmation Modal */}
//       <Modal
//         animationType="fade"
//         transparent={true}
//         visible={deleteModalVisible}
//         onRequestClose={() => setDeleteModalVisible(false)}>
//         <View style={styles.modalOverlay}>
//           <View style={[styles.modalContainer, styles.deleteModalContainer]}>
//             <View style={styles.deleteModalIconContainer}>
//               <Ionicons name="warning" size={48} color="#FF5722" />
//             </View>

//             <Text style={styles.deleteModalTitle}>Delete User</Text>
//             <Text style={styles.deleteModalText}>
//               Are you sure you want to delete this user? This action cannot be
//               undone.
//             </Text>

//             <View style={styles.deleteModalActions}>
//               <TouchableOpacity
//                 style={[styles.modalButton, styles.cancelButton]}
//                 onPress={() => setDeleteModalVisible(false)}>
//                 <Text style={styles.cancelButtonText}>Cancel</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={[styles.modalButton, styles.deleteButton]}
//                 onPress={deleteUser}>
//                 <Text style={styles.deleteButtonText}>Delete</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f9f9f9',
//     paddingHorizontal: 20,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     marginTop: 20,
//     marginBottom: 15,
//   },
//   fieldContainer: {
//     marginBottom: 15,
//   },
//   fieldLabel: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 5,
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     paddingHorizontal: 15,
//     shadowColor: '#000',
//     shadowOffset: {width: 0, height: 1},
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   input: {
//     flex: 1,
//     paddingVertical: 12,
//     fontSize: 16,
//     color: '#333',
//   },
//   multilineInput: {
//     minHeight: 100,
//     paddingTop: 12,
//   },
//   icon: {
//     marginLeft: 10,
//   },
//   linkedUsersContainer: {
//     marginBottom: 20,
//   },
//   userCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     padding: 15,
//     marginBottom: 10,
//     shadowColor: '#000',
//     shadowOffset: {width: 0, height: 1},
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   userInitial: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#2196F3',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 15,
//   },
//   initialText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   userInfo: {
//     flex: 1,
//   },
//   userName: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 3,
//   },
//   userEmail: {
//     fontSize: 14,
//     color: '#777',
//   },
//   userAction: {
//     padding: 5,
//   },
//   addUserButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     padding: 15,
//     marginTop: 5,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderStyle: 'dashed',
//   },
//   addUserText: {
//     marginLeft: 10,
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#FF5722',
//   },
//   errorText: {
//     color: '#FF0000',
//     fontSize: 12,
//     marginTop: 5,
//     paddingLeft: 5,
//   },

//   // Modal styles
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContainer: {
//     width: '90%',
//     backgroundColor: '#fff',
//     borderRadius: 15,
//     padding: 20,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   modalBody: {
//     marginBottom: 10,
//   },
//   modalActions: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 10,
//   },
//   modalButton: {
//     borderRadius: 8,
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     minWidth: '45%',
//     alignItems: 'center',
//   },
//   cancelButton: {
//     backgroundColor: '#f5f5f5',
//   },
//   cancelButtonText: {
//     color: '#666',
//     fontWeight: '600',
//     fontSize: 16,
//   },
//   addButton: {
//     backgroundColor: '#FF5722',
//   },
//   addButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 16,
//   },
//   disabledButton: {
//     opacity: 0.5,
//   },

//   // Delete Modal styles
//   deleteModalContainer: {
//     alignItems: 'center',
//     maxWidth: 320,
//   },
//   deleteModalIconContainer: {
//     marginBottom: 15,
//   },
//   deleteModalTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 10,
//   },
//   deleteModalText: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   deleteModalActions: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: '100%',
//   },
//   deleteButton: {
//     backgroundColor: '#FF3B30',
//   },
//   deleteButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 16,
//   },
// });

// export default EditableProfileFields;
