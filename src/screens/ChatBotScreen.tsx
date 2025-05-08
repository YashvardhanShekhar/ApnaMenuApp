import {
  StyleSheet,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {createUserContent, GoogleGenAI} from '@google/genai';
import {GEMINI_API_KEY} from '@env';
import {ActivityIndicator} from 'react-native-paper';
import {checkInternet} from '../components/checkInternet';
const ai = new GoogleGenAI({apiKey: GEMINI_API_KEY});

export const uploadPhoto = async image => {
  console.log(image);
  const ci = checkInternet();
  if (!ci) {
    return;
  }
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [
      createUserContent([
        'What is this object?',
        {inlineData: {mimeType: 'image/jpeg', data: image}},
      ]),
    ],
  });
  console.log(response.text);
};

const ChatBotScreen = () => {
  const [res, setRes] = useState('Click me');
  const [loading, setLoading] = useState(false);

  return (
    <View>
      <Text>chatBotScreen</Text>
      <TouchableOpacity
        onPress={async () => {
          setLoading(true);
          // await tell();
          setLoading(false);
        }}>
        {' '}
        <Text> {res} </Text>{' '}
      </TouchableOpacity>
      {loading && <ActivityIndicator></ActivityIndicator>}
    </View>
  );
};

export default ChatBotScreen;

const styles = StyleSheet.create({});
