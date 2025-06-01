import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect, useCallback, useRef} from 'react';
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
  saveStats,
  syncData,
} from '../services/storageService';
import {handleLogOut} from '../services/authentication';
import * as NavigationService from '../services/navigationService';
import {checkInternet} from '../components/checkInternet';
import {launchImageLibrary} from 'react-native-image-picker';
import {parseMenu} from '../components/genai';
import {styles} from '../styles/profileScreenStyle';

const ProfileScreen = () => {
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState<string>('');
  const [profileData, setProfileData] = useState<ProfileInformation | null>(
    null,
  );
  const [stats, setStats] = useState<Stats>({});
  const [refreshing, setRefreshing] = useState(false);

  let loadData = async () => {};

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const ci = await checkInternet();
    if (!ci) {
      setRefreshing(false);
      return;
    }
    await syncData();
    await loadData();
    setRefreshing(false);
  }, []);

  const [user, setUser] = useState({
    name: 'User Unavailable',
    photo: '',
  });

  useEffect(() => {
    loadData = async () => {
      try {
        setRefreshing(true);
        loadStats();
        const user = await fetchUser();
        if (user) {
          setUser(user);
        }
        const info = await fetchProfileInfo();
        const url = await fetchUrl();
        if (info) {
          setProfileData(info);
        }
        if (url) {
          setUrl(url);
        }
        const stats = await fetchStats();
        if (stats) {
          setStats(stats);
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

  const loadStats = async () => {
    // Calculate menu item statistics
    const menuItems = await fetchMenu();

    const totalItems = Object.keys(menuItems).reduce(
      (total, category) => total + Object.keys(menuItems[category]).length,
      0,
    );

    const availableItems = Object.keys(menuItems).reduce(
      (total, category) =>
        total +
        Object.keys(menuItems[category]).filter(
          item => menuItems[category][item].status,
        ).length,
      0,
    );

    const soldOutItems = totalItems - availableItems;
    await saveStats(totalItems, availableItems, soldOutItems);
  };

  const handleAddDish = (category: string) => {
    NavigationService.navigate('AddDish', {
      category,
    });
  };

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

  const [imgState, setImgState] = useState(false);
  const upload = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: true,
      },
      async (response: any) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          console.log('ImagePicker Error: ', response.errorMessage);
        } else {
          setImgState(true);
          const base64Image = response.assets[0].base64;
          const ci = await checkInternet();
          if (!ci) {
            setImgState(false);
            return;
          }
          const menuData = await parseMenu(base64Image);
          // const menuData = {
          //   menu: {
          //     Coffee: {
          //       Espresso: {
          //         name: 'Espresso',
          //         price: 12.99,
          //         status: true,
          //       },
          //       'Mocha Latte': {
          //         name: 'Mocha Latte',
          //         price: 22,
          //         status: true,
          //       },
          //     },
          //     Snacks: {
          //       'French Fries': {
          //         name: 'French Fries',
          //         price: 12.99,
          //         status: true,
          //       },
          //     },
          //   },
          // };
          // console.log('parse complete');
          NavigationService.navigate('MenuEditScreen', {menuData});
          setImgState(false);
        }
      },
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0F766E']} // spinner color (Android)
            progressBackgroundColor="#FFFFFF" // background color (Android)
            tintColor="#0F766E" // spinner color (iOS)
          />
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
            {url}
            
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
          <TouchableOpacity
            style={styles.statusCard}
            onPress={upload}
            disabled={imgState}>
            <View style={styles.statusContent}>
              <Text style={styles.statusTitle}>Upload photo of you menu</Text>
              <Text style={styles.statusDescription}>
                {imgState
                  ? 'Processing your menu image... Please wait'
                  : 'Upload a photo of your menu to automatically import items'}
              </Text>
            </View>
            {imgState ? (
              <ActivityIndicator size="small" color="#0F766E" />
            ) : (
              <Icon name="camera" size={24} color="#64748B" />
            )}
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

const ContactItem = ({
  icon,
  title,
  value,
  placeholder,
  isDescription = false,
}: ContactItemProps) => {
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

export default ProfileScreen;
