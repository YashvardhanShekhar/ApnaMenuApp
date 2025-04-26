import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import firestore from '@react-native-firebase/firestore';

const AddCategory = () => {

    const ref = firestore().collection('restaurants').();
  return (
    <View>
      <Text>AddCategory</Text>
    </View>
  )
}

export default AddCategory

const styles = StyleSheet.create({})