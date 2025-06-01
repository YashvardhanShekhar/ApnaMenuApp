import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Keyboard,
  Animated,
} from 'react-native';
import styles from '../styles/chatScreenStyle';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Animatable from 'react-native-animatable';
import {LinearGradient} from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {ActivityIndicator} from 'react-native-paper';
import {Haptic, HapticHeavy, HapticMedium} from '../components/haptics';
import {chatBot, setupModel} from '../components/genai';
import {fetchMessages, saveMessages} from '../services/storageService';
import {saveMessagesDB} from '../services/databaseManager';
import {checkInternet} from '../components/checkInternet';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import AudioInput from '../components/chatBot/audioInput';
import TextInputBox from '../components/chatBot/TextInputBox';

const ChatScreen = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! How can I help you today?',
      role: 'model',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const navigation = useNavigation();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const recorder = useRef(new AudioRecorderPlayer()).current;
  const [recordingPath, setRecordingPath] = useState('');
  // const [base64Audio, setBase64Audio] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [waveformValues, setWaveformValues] = useState<number[]>([]);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({animated: true});
      }
    }, 100);
  }, [messages, keyboardVisible, navigation, isRecording]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    const fetch = async () => {
      const msg = await fetchMessages();
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Fetched messages:', msg);
      if (msg.length > 0) {
        setMessages(msg);
      }
    };
    fetch();
  }, [navigation]);

  // Create initial random values for waveform
  useEffect(() => {
    const initialValues = Array(30)
      .fill(0)
      .map(() => Math.random() * 30 + 10);
    setWaveformValues(initialValues);
  }, []);

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
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
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        const newValues: any = Array(30)
          .fill(0)
          .map(() => Math.random() * 30 + 10);
        setWaveformValues(newValues);
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
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
      // setBase64Audio(base64);
      return base64;
    } catch (error) {
      console.error('Error stopping recording:', error);
      setIsRecording(false);
      return null;
    }
  };

  const sendAudio = async () => {
    const base64Audio = await stopRecording();
    
    const oldMessages: Message[] = messages;
    Haptic();
    
    const newUserMessage: Message = {
      id: String(Date.now()),
      content: '🎤 Audio message',
      role: 'user',
    };
    
    setMessages([...messages, newUserMessage]);
    // setBase64Audio('');
    
    setIsTyping(true);
    const ci = await checkInternet();
    if (!ci) {
      setIsTyping(false);
      return;
    }
    
    if (!base64Audio){
      console.error('no audio messege');
      return;
    }
    
    const botMsg = await chatBot('🎤 Audio message', false, base64Audio);
    if (!botMsg) {
      console.error('no response from bot',botMsg);
      setIsTyping(false);
      return;
    }

    const aiResponse: Message = {
      id: String(Date.now() + 1),
      content: botMsg,
      role: 'model',
    };

    const prevMessage: Message[] = [...oldMessages, newUserMessage, aiResponse];
    const tempPrevMessage = prevMessage.slice(-80);
    setMessages(tempPrevMessage);

    setIsTyping(false);
    HapticHeavy();
    const deleteStatus = messages.length > 80;
    await saveMessagesDB(
      deleteStatus,
      prevMessage[0],
      prevMessage[1],
      newUserMessage,
      aiResponse,
    );
    await saveMessages(tempPrevMessage);
  };

  const handleSend = async () => {
    if (inputText.trim() === '') return;

    const ci = await checkInternet();
    if (!ci) {
      return;
    }

    const oldMessages: Message[] = messages;
    Haptic();

    const newUserMessage: Message = {
      id: String(Date.now()),
      content: inputText,
      role: 'user',
    };

    setMessages([...messages, newUserMessage]);
    setInputText('');

    setIsTyping(true);

    const botMsg = await chatBot(newUserMessage.content, true, '');
    if (!botMsg) {
      setIsTyping(false);
      return;
    }

    const aiResponse: Message = {
      id: String(Date.now()),
      content: botMsg,
      role: 'model',
    };

    const prevMessage = [...oldMessages, newUserMessage, aiResponse];
    const tempPrevMessage = prevMessage.slice(-60);
    setMessages(tempPrevMessage);

    setIsTyping(false);
    HapticHeavy();
    const deleteStatus = messages.length >= 60;
    console.log(deleteStatus+" "+ messages.length);
    await saveMessagesDB(
      deleteStatus,
      prevMessage[0],
      prevMessage[1],
      newUserMessage,
      aiResponse,
    );
    await saveMessages(tempPrevMessage);
    console.log('chats updated in database');
  };

  const renderItem = ({item}: {item: Message}) => {
    const isUser = item.role === 'user';

    return (
      <View
        style={[
          styles.messageBubbleContainer,
          isUser ? styles.userMessageContainer : styles.aiMessageContainer,
        ]}>
        {isUser ? (
          <LinearGradient
            colors={['#0F766E', '#115E59']}
            style={[styles.messageBubble, styles.userMessageBubble]}>
            <Text style={styles.userMessageText}>{item.content}</Text>
          </LinearGradient>
        ) : (
          <View style={[styles.messageBubble, styles.aiMessageBubble]}>
            <Text style={styles.aiMessageText}>{item.content}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <Animatable.View
        animation="fadeIn"
        duration={500}
        style={[styles.messageBubbleContainer, styles.aiMessageContainer]}>
        <View
          style={[
            styles.messageBubble,
            styles.aiMessageBubble,
            styles.typingBubble,
          ]}>
          <ActivityIndicator
            size="small"
            color="#0F766E"
            style={styles.typingDot}
          />
          <Text style={styles.typingText}>Chotu is thinking...</Text>
        </View>
      </Animatable.View>
    );
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>Chotu</Text>
          <Text style={styles.subtitle}>a Smart Chatbot</Text>
        </View>

        <TouchableOpacity
          style={styles.menuButton}
          disabled={showWarning}
          onPress={() => {
            setTimeout(() => {
              setShowWarning(false);
            }, 5000);
            setShowWarning(true);
          }}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={showWarning ? '#64748B' : '#0F172A'}
          />
        </TouchableOpacity>
      </View>
      {showWarning && (
        <Text style={styles.warning}>Chotu can make mistakes.</Text>
      )}

      {/* Chat Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesContent}
        style={styles.messagesContainer}
        ListFooterComponent={renderTypingIndicator}
      />

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 10}>
        <View style={styles.inputContainer}>
          {isRecording ? (
            <AudioInput
              stopRecording={stopRecording}
              isTyping={isTyping}
              sendAudio={sendAudio}
              recordingTime={recordingTime}
              renderWaveform={renderWaveform}
              formatTime={formatTime}
            />
          ) : (
            <TextInputBox
              inputText={inputText}
              setInputText={setInputText}
              isTyping={isTyping}
              handleSend={handleSend}
              startRecording={startRecording}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;