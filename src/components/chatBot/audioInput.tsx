import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from '../../styles/chatScreenStyle';

const AudioInput = ({
  stopRecording,
  isTyping,
  sendAudio,
  recordingTime,
  renderWaveform,
  formatTime,
}: any) => {
  return (
    <View style={styles.recordingContainer}>
      <View style={styles.recordingHeader}>
        <View style={styles.recordingIndicatorContainer}>
          <View style={styles.recordingIndicator} />
          <Text style={styles.recordingText}>
            Recording {formatTime(recordingTime)}
          </Text>
        </View>
      </View>

      <View style={styles.recordingControls}>
        <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
          <Ionicons name="close" size={20} color="#0F172A" />
        </TouchableOpacity>
        {renderWaveform()}
        <TouchableOpacity
          style={[
            styles.sendButton,
            isTyping ? styles.sendButtonDisabled : null,
          ]}
          onPress={sendAudio}>
          <Ionicons name="send" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AudioInput;
