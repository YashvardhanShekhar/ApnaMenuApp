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
  const [base64Audio, setBase64Audio] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [waveformValues, setWaveformValues] = useState<number[]>([]);
  const waveformAnimationRef = useRef(null);

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

    const oldMessages: Message[] = messages;
    Haptic();

    const newUserMessage: Message = {
      id: String(Date.now()),
      content: '🎤 Audio message',
      role: 'user',
    };

    setMessages([...messages, newUserMessage]);
    setBase64Audio('');

    const botMsg = await chatBot('🎤 Audio message', false, base64Audio);
    if (!botMsg) {
      setIsTyping(false);
      return;
    }

    const aiResponse: Message = {
      id: String(Date.now() + 1),
      content: botMsg,
      role: 'model',
    };

    const prevMessage: Message[] = [...oldMessages, newUserMessage, aiResponse];
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
          onPress={() => {
            setMessages([
              {
                id: '1',
                content: 'Hello! How can I help you today?',
                role: 'model',
              },
            ]);
          }}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Ionicons name="ellipsis-vertical" size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

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
                <TouchableOpacity
                  style={styles.stopButton}
                  onPress={stopRecording}>
                  <Ionicons name="close" size={20} color="#0F172A" />
                </TouchableOpacity>
                {renderWaveform()}

                <TouchableOpacity style={styles.sendButton} onPress={sendAudio}>
                  <Ionicons name="send" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.inputWrapper}>
              <TouchableOpacity
                style={styles.micButton}
                onPress={startRecording}>
                <Ionicons name="mic" size={20} color="#0F766E" />
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
                  !inputText.trim() || isTyping
                    ? styles.sendButtonDisabled
                    : null,
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
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  menuButton: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubbleContainer: {
    marginBottom: 16,
    flexDirection: 'row',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  aiMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  userMessageBubble: {
    alignSelf: 'flex-end',
    marginLeft: 'auto',
  },
  aiMessageBubble: {
    backgroundColor: '#F1F5F9',
    alignSelf: 'flex-start',
    marginRight: 'auto',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  aiMessageText: {
    color: '#0F172A',
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0F172A',
  },
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
  sendButtonDisabled: {
    backgroundColor: '#E2E8F0',
    elevation: 0,
    shadowOpacity: 0,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  typingDot: {
    marginRight: 8,
  },
  typingText: {
    color: '#64748B',
    fontSize: 14,
  },
  // Recording styles
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

export default ChatScreen;
