import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Switch} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../screens/ThemeContext';
import {useNavigation} from '@react-navigation/native';
import {handleLogOut} from '../components/authentication';

import firestore, { average } from '@react-native-firebase/firestore';
import {addNewDish, addCategory, addFirstDish} from '../components/databaseManager';

const SettingsScreen = () => {
  const {theme, toggleTheme} = useTheme();
  const isDark = theme === 'dark';
  const navigation = useNavigation();
  
  const pressed = async() => {
     await addNewDish('pappu','soda drink',50);
  }

  return (
    <View
      style={[styles.container, {backgroundColor: isDark ? '#111' : '#fff'}]}>
      <Text style={[styles.title, {color: isDark ? '#fff' : '#222'}]}>
        Settings
      </Text>

      <TouchableOpacity style={styles.item}
        onPress={pressed}
      >
        <Ionicons
          name="person-outline"
          size={22}
          color={isDark ? '#fff' : '#333'}
        />
        <Text style={[styles.label, {color: isDark ? '#fff' : '#333'}]}>
          Account
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item}>
        <Ionicons
          name="notifications-outline"
          size={22}
          color={isDark ? '#fff' : '#333'}
        />
        <Text style={[styles.label, {color: isDark ? '#fff' : '#333'}]}>
          Notifications
        </Text>
      </TouchableOpacity>

      <View style={styles.item}>
        <Ionicons
          name="moon-outline"
          size={22}
          color={isDark ? '#fff' : '#333'}
        />
        <Text style={[styles.label, {color: isDark ? '#fff' : '#333'}]}>
          Dark Mode
        </Text>
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          thumbColor={isDark ? '#fff' : '#aaa'}
          trackColor={{false: '#ccc', true: '#444'}}
          style={{marginLeft: 'auto'}}
        />
      </View>

      <TouchableOpacity
        style={styles.item}
        onPress={() => handleLogOut(navigation)}>
        <Ionicons name="log-out-outline" size={22} color="#ff4444" />
        <Text style={[styles.label, {color: '#ff4444'}]}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 25,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 30,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    marginLeft: 15,
    fontSize: 16,
  },
});

export default SettingsScreen;
