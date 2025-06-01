import React from 'react';
import {View, TextInput, TouchableOpacity} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from '../../styles/chatScreenStyle';

const TextInputBox = ({
  inputText,
  setInputText,
  isTyping,
  handleSend,
  startRecording,
}: any) => {
  return (
    <View style={styles.inputWrapper}>
      <TouchableOpacity
        style={[styles.micButton]}
        onPress={startRecording}>
        <Ionicons
          name="mic"
          size={20}
          color='#FFFFFF'
        />
      </TouchableOpacity>

      <TextInput
        style={[styles.input, {maxHeight: 100}]}
        value={inputText}
        onChangeText={setInputText}
        placeholder="Type a message..."
        placeholderTextColor="#94A3B8"
        multiline
      />

      <TouchableOpacity
        style={[
          styles.sendButton,
          !inputText.trim() || isTyping ? styles.sendButtonDisabled : null,
        ]}
        onPress={handleSend}
        disabled={!inputText.trim() || isTyping}>
        <Ionicons
          name="send"
          size={20}
          color={inputText.trim() && !isTyping ? '#FFFFFF' : '#CBD5E1'}
        />
      </TouchableOpacity>
    </View>
  );
};

export default TextInputBox;
