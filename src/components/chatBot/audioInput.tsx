import React, {useEffect, useRef, useState} from 'react';
import {View, Button, Text, TouchableOpacity, StyleSheet} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import {Haptic} from '../haptics';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {chatBot} from '../genai';

const AudioInput = () => {
  const recorder = useRef(new AudioRecorderPlayer()).current;
  const [recordingPath, setRecordingPath] = useState('');
  const [base64Audio, setBase64Audio] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [waveformValues, setWaveformValues] = useState([]);
  const waveformAnimationRef = useRef(null);

  // Create initial random values for waveform
  useEffect(() => {
    const initialValues = Array(30)
      .fill(0)
      .map(() => Math.random() * 30 + 10);
    setWaveformValues(initialValues);
  }, []);

  // Recording timer
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Animate waveform when recording
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        const newValues = Array(30)
          .fill(0)
          .map(() => Math.random() * 30 + 10);
        setWaveformValues(newValues);
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const startRecording = async () => {
    try {
      const result = await recorder.startRecorder();
      setRecordingPath(result);
      setIsRecording(true);
      Haptic();
      console.log('Recording started:', result);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = async () => {
    try {
      const result = await recorder.stopRecorder();
      console.log('Recording stopped:', result);
      setIsRecording(false);
      HapticMedium();

      const base64 = await RNFS.readFile(result, 'base64');
      setBase64Audio(base64);
    } catch (error) {
      console.error('Error stopping recording:', error);
      setIsRecording(false);
    }
  };

  const sendAudio = async () => {
    if (!base64Audio) return;
    await stopRecording();
    setIsTyping(true);
    const ci = await checkInternet();
    if (!ci) {
      setIsTyping(false);
      return;
    }

    const oldMessages:Message[] = messages;
    Haptic();

    const newUserMessage: Message = {
      id: String(Date.now()),
      content: '🎤 Audio message',
      role: 'user',
    };

    setMessages([...messages, newUserMessage]);
    setBase64Audio('');

    const botMsg = await chatBot('# AUDIO MESSAGE', false, base64Audio);
    if (!botMsg) {
      setIsTyping(false);
      return;
    }

    const aiResponse: Message = {
      id: String(Date.now() + 1),
      content: botMsg,
      role: 'model',
    };

    const prevMessage:Message[] = [...oldMessages, newUserMessage, aiResponse];
    const tempPrevMessage = prevMessage.slice(-100);
    setMessages(tempPrevMessage);

    setIsTyping(false);
    HapticHeavy();
    const deleteStatus = messages.length > 100;
    await saveMessagesDB(
      deleteStatus,
      prevMessage[0],
      prevMessage[1],
      newUserMessage,
      aiResponse,
    );
    await saveMessages(tempPrevMessage);
  };

  const handleRecording = async () => {
    isRecording ? await startRecording() : await stopRecording();
    setIsRecording(!isRecording);
    Haptic();
  };

  const renderWaveform = () => {
    return (
      <View style={styles.waveformContainer}>
        {waveformValues.map((value, index) => (
          <View
            key={index}
            style={[
              styles.waveformBar,
              {
                height: value,
                backgroundColor: index < 10 ? '#2563EB' : '#60A5FA',
              },
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <>
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

          <TouchableOpacity style={styles.sendButton} onPress={sendAudio}>
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  sendButton: {
    marginLeft: 12,
    backgroundColor: '#0F766E',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#0F766E',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  recordingContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  recordingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  recordingIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginRight: 8,
    opacity: 1,
    // Pulse animation
    shadowColor: '#EF4444',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  recordingText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  waveformContainer: {
    width: '62%',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  waveformBar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: '#2563EB',
    marginHorizontal: 2,
  },
  recordingControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stopButton: {
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

export default AudioInput;
