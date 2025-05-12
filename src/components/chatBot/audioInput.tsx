import React, {useRef, useState} from 'react';
import {View, Button, Text, TouchableOpacity, StyleSheet} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import {Haptic} from '../haptics';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {chatBot} from '../genai';

const Mic = () => {
  const recorder = useRef(new AudioRecorderPlayer()).current;
  const [recordingPath, setRecordingPath] = useState('');
  const [base64Audio, setBase64Audio] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = async () => {
    const result = await recorder.startRecorder();
    setRecordingPath(result);
    console.log('Recording started:', result);
  };

  const stopRecording = async () => {
    const result = await recorder.stopRecorder();
    console.log('Recording stopped:', result);

    // Read the file and convert to base64
    const base64 = await RNFS.readFile(result, 'base64');
    setBase64Audio(base64);

    console.log('Base64 Audio:', base64.slice(0, 100) + '...'); // Print sample
  };
  const sendAudio = async () => {
    const res = await chatBot('# AUDIO MESSAGE', false, base64Audio);
    console.log(res);
  };

  const handleRecording = async () => {
    isRecording ? await startRecording() : await stopRecording();
    setIsRecording(!isRecording);
    Haptic();
  };

  return (
    <>
      <TouchableOpacity
        style={styles.micButton}
        onPress={() => {
          handleRecording();
        }}>
        <Ionicons name="mic" size={20} color="#0F766E" />
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  micButton: {
    marginRight: 12,
    backgroundColor: '#F1F5F9',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
});

export default Mic;
