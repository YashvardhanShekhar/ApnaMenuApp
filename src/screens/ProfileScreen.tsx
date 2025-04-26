import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ProfileScreen = () => {
  const [profileCompletion, setProfileCompletion] = useState(65); // Example profile completion percentage
  const [profilePhotoUri, setProfilePhotoUri] = useState<string>(
    'https://fiverr-res.cloudinary.com/images/q_auto,f_auto/gigs/129638459/original/a2f7a0cf96e7e8c491b3f1ac4fa7a1588a8273b7/draw-your-profile-picture-with-minimalist-cartoon-style.jpg',
  );

  React.useEffect(() => {
    const fetchProfilePhoto = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          setProfilePhotoUri(user.photo);
        }
      } catch (error) {
        console.error('Error fetching profile photo:', error);
      }
    };

    fetchProfilePhoto();
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image
              // source={require('../assets/icon.png')}
              style={styles.profileImage}
              // If you don't have a local image, use a placeholder:
              source={{ uri: profilePhotoUri }}
            />
          </View>
          <Text style={styles.restaurantName}>Spice Garden</Text>
          <Text style={styles.restaurantType}>Authentic Indian Cuisine</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>156</Text>
            <Text style={styles.statLabel}>Menu Items</Text>
          </View>
          <View style={[styles.statItem, styles.statBorder]}>
            <Text style={styles.statNumber}>847</Text>
            <Text style={styles.statLabel}>Daily Viewers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>42</Text>
            <Text style={styles.statLabel}>Orders Today</Text>
          </View>
        </View>

        {/* Profile Status */}
        <Text style={styles.sectionTitle}>Profile Status</Text>

        {/* Status Cards */}
        <View style={styles.statusCardsContainer}>
          {/* Phone Number Card */}
          <TouchableOpacity style={styles.statusCard}>
            <View
              style={[styles.statusIndicator, {backgroundColor: '#4CAF50'}]}>
              <Text style={styles.statusPercentage}>100%</Text>
            </View>
            <View style={styles.statusContent}>
              <Text style={styles.statusTitle}>Add Phone Number</Text>
              <Text style={styles.statusDescription}>
                Contact details for customers
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#888" />
          </TouchableOpacity>

          {/* Address Card */}
          <TouchableOpacity style={styles.statusCard}>
            <View
              style={[styles.statusIndicator, {backgroundColor: '#FFC107'}]}>
              <Text style={styles.statusPercentage}>50%</Text>
            </View>
            <View style={styles.statusContent}>
              <Text style={styles.statusTitle}>Complete Address</Text>
              <Text style={styles.statusDescription}>
                Full location details with landmark
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#888" />
          </TouchableOpacity>

          {/* Restaurant Description Card */}
          <TouchableOpacity style={styles.statusCard}>
            <View
              style={[styles.statusIndicator, {backgroundColor: '#FF5722'}]}>
              <Text style={styles.statusPercentage}>0%</Text>
            </View>
            <View style={styles.statusContent}>
              <Text style={styles.statusTitle}>Add Description</Text>
              <Text style={styles.statusDescription}>
                Tell about your restaurant
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#888" />
          </TouchableOpacity>

          {/* Menu Items Card */}
          <TouchableOpacity style={styles.statusCard}>
            <View
              style={[styles.statusIndicator, {backgroundColor: '#2196F3'}]}>
              <Text style={styles.statusPercentage}>75%</Text>
            </View>
            <View style={styles.statusContent}>
              <Text style={styles.statusTitle}>Upload Menu Items</Text>
              <Text style={styles.statusDescription}>
                Add your dishes with photos
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#888" />
          </TouchableOpacity>
        </View>

        {/* Pro Button */}
        <View style={styles.proContainer}>
          <Text style={styles.proTitle}>Get ApnaMenu Pro</Text>
          <Text style={styles.proDescription}>
            Access advanced analytics, premium placement, and more
          </Text>
          <TouchableOpacity style={styles.proButton}>
            <Text style={styles.proButtonText}>Upgrade Now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 25,
    backgroundColor: '#fff',
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F5A623',
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
    marginBottom: 5,
  },
  restaurantType: {
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
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
    borderColor: '#eee',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 20,
    marginTop: 10,
    marginBottom: 15,
  },
  statusCardsContainer: {
    marginHorizontal: 20,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 15,
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
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 3,
  },
  statusDescription: {
    fontSize: 13,
    color: '#777',
  },
  proContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  proTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  proDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  proButton: {
    backgroundColor: '#FF5722',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  proButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default ProfileScreen;
