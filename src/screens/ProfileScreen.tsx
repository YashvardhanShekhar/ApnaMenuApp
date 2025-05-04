import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect, useCallback} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  ImageBackground,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {
  fetchMenu,
  fetchProfileInfo,
  fetchStats,
  fetchUrl,
  fetchUser,
  syncData,
} from '../services/storageService';
import Snackbar from 'react-native-snackbar';
import {handleLogOut} from '../services/authentication';
import * as NavigationService from '../services/navigationService';
import {checkInternet} from '../components/chechInternet';

const ProfileScreen = () => {
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState<string>('');
  const [profileData, setProfileData] = useState<ProfileInformation | null>(
    null,
  );
  const [stats, setStats] = useState<Stats>({});
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const ci = await checkInternet();
    if (!ci) {
      setRefreshing(false);
      return;
    }
    await syncData();
    setRefreshing(false);
  }, []);

  const [user, setUser] = useState({
    name: 'User Unavailable',
    photo: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setRefreshing(true);

        const user = await fetchUser();
        if (user) {
          setUser(user);
        }
        const stats = await fetchStats();
        if (stats) {
          setStats(stats);
        }
        const info = await fetchProfileInfo();
        console.log(info);
        const url = await fetchUrl();
        if (info) {
          setProfileData(info);
        }
        if (url) {
          setUrl(url);
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setRefreshing(false);
      }
    };
    if (isFocused) {
      loadData();
    }
  }, [isFocused]);

  function handleEditInfo() {
    NavigationService.navigate('EditInfo');
  }

  function handleManageLinkedUsers() {
    NavigationService.navigate('LinkedUsers');
  }

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    await handleLogOut();
    setIsLoggingOut(false);
  }

  function handleDeleteAccount() {
    NavigationService.navigate('AccountDeletion');
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <ImageBackground
              source={require('../assets/profile.png')}
              resizeMode="cover">
              <Image style={styles.profileImage} source={{uri: user.photo}} />
            </ImageBackground>
          </View>
          <Text style={styles.restaurantName}>{profileData?.name}</Text>
          <Text style={styles.restaurantType}>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(`https://apnamenu.vercel.app/${url}`)
              }>
              <Text style={{color: '#0F766E', textDecorationLine: 'underline'}}>
                Visit Website
              </Text>
            </TouchableOpacity>
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalItems}</Text>
            <Text style={styles.statLabel}>Total Items</Text>
          </View>
          <View style={[styles.statItem, styles.statBorder]}>
            <Text style={styles.statNumber}>{stats.availableItems}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.soldOutItems}</Text>
            <Text style={styles.statLabel}>Sold Out</Text>
          </View>
        </View>

        {/* Contact Information Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Profile Details</Text>

          <View style={styles.contactContainer}>
            <ContactItem
              icon="phone"
              title="Phone Number"
              value={profileData?.phoneNumber || 'Not added yet'}
              placeholder="Add your phone number"
            />

            <ContactItem
              icon="map-pin"
              title="Address"
              value={profileData?.address || 'Not added yet'}
              placeholder="Add your address"
            />

            <ContactItem
              icon="info"
              title="Description"
              value={profileData?.description || 'Not added yet'}
              placeholder="Add a description"
              isDescription={true}
            />

            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditInfo}>
              <Icon
                name="edit-2"
                size={20}
                color="#fff"
                style={styles.buttonIcon}
              />
              <Text style={styles.editButtonText}>Edit Information</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Status Cards */}
        <View style={styles.statusCardsContainer}>
          <TouchableOpacity style={styles.statusCard}>
            <View style={styles.statusContent}>
              <Text style={styles.statusTitle}>Upload Menu Items</Text>
              <Text style={styles.statusDescription}>
                Add your dishes with photos
              </Text>
            </View>
            <Icon name="camera" size={24} color="#64748B" />
            
          </TouchableOpacity>
        </View>

        {/* Manage Linked Users Button */}
        <View style={styles.manageUsersContainer}>
          <TouchableOpacity
            style={styles.manageUsersButton}
            onPress={handleManageLinkedUsers}>
            <Icon
              name="users"
              size={20}
              color="#fff"
              style={styles.buttonIcon}
            />
            <Text style={styles.manageUsersButtonText}>
              Manage Linked Users
            </Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.logoutButton, isLoggingOut && {opacity: 0.7}]}
            onPress={handleLogout}
            disabled={isLoggingOut}>
            {isLoggingOut ? (
              <>
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                  style={styles.buttonIcon}
                />
                <Text style={styles.logoutButtonText}>Logging out...</Text>
              </>
            ) : (
              <>
                <Icon
                  name="log-out"
                  size={20}
                  color="#fff"
                  style={styles.buttonIcon}
                />
                <Text style={styles.logoutButtonText}>Logout</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Delete Account Button */}
        <View style={styles.deleteAccountContainer}>
          <TouchableOpacity
            style={styles.deleteAccountButton}
            onPress={handleDeleteAccount}>
            <Icon
              name="trash-2"
              size={20}
              color="#fff"
              style={styles.buttonIcon}
            />
            <Text style={styles.deleteAccountButtonText}>
              Delete Account Permanently
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Component for displaying contact information items
const ContactItem = ({
  icon,
  title,
  value,
  placeholder,
  isDescription = false,
}) => {
  const isEmpty = !value || value === 'Not added yet';

  return (
    <View style={styles.contactItem}>
      <View style={styles.contactIconContainer}>
        <Icon name={icon} size={20} color="#0F766E" />
      </View>
      <View style={styles.contactContent}>
        <Text style={styles.contactTitle}>{title}</Text>
        <Text
          style={[
            styles.contactValue,
            isEmpty && styles.contactPlaceholder,
            isDescription && styles.contactDescription,
          ]}
          numberOfLines={isDescription ? 3 : 1}>
          {isEmpty ? placeholder : value}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingBottom: 50,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 25,
    backgroundColor: '#FFFFFF',
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#64748B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    overflow: 'hidden',
  },
  profileImage: {
    width: 100,
    height: 100,
  },
  restaurantName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 5,
  },
  restaurantType: {
    fontSize: 16,
    color: '#64748B',
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E2E8F0',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  sectionContainer: {
    marginTop: 24,
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 15,
  },
  contactContainer: {
    marginTop: 5,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  contactIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 15,
    color: '#0F172A',
    lineHeight: 22,
  },
  contactDescription: {
    lineHeight: 20,
  },
  contactPlaceholder: {
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  editButton: {
    backgroundColor: '#0F766E',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonIcon: {
    marginRight: 8,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  statusCardsContainer: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  statusCard: {
    paddingRight:25,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statusIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  statusPercentage: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 3,
  },
  statusDescription: {
    fontSize: 13,
    color: '#64748B',
  },
  manageUsersContainer: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  manageUsersButton: {
    backgroundColor: '#0F766E',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageUsersButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  // New styles for logout button
  actionButtonsContainer: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  logoutButton: {
    backgroundColor: '#64748B',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.9,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  // New styles for delete account button
  deleteAccountContainer: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 40,
  },
  deleteAccountButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteAccountButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ProfileScreen;
