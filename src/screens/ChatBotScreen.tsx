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
import { saveMessagesDB } from '../services/databaseManager';
import { checkInternet } from '../components/checkInternet';
import Mic from '../components/chatBot/audioInput';

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

  useEffect(() => {
    setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({animated: true});
      }
    }, 100);
  }, [messages, keyboardVisible, navigation]);

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

  const handleSend = async () => {
    if (inputText.trim() === '') return;
    
    const ci = await checkInternet();
    if (!ci) {
      return;
    }

    const oldMessages = messages;
    Haptic();

    const newUserMessage:Message = {
      id: String(Date.now()),
      content: inputText,
      role: 'user',
    };

    setMessages([...messages, newUserMessage]);
    setInputText('');

    setIsTyping(true);

    const botMsg = await chatBot(newUserMessage.content, true, '');
    if(!botMsg) {
      setIsTyping(false);
      return;
    }

    const aiResponse:Message = {
      id: String(Date.now()),
      content: botMsg,
      role: 'model',
    };
    
    const prevMessage = [...oldMessages, newUserMessage, aiResponse];
    const tempPrevMessage = prevMessage.slice(-100)
    setMessages(tempPrevMessage);

    setIsTyping(false);
    HapticHeavy();
    const deleteStatus = messages.length>100;
    await saveMessagesDB(
      deleteStatus,
      prevMessage[0],
      prevMessage[1],
      newUserMessage,
      aiResponse,
    );
    await saveMessages(tempPrevMessage);
    console.log('chats updated in database')
  };

  const renderItem = ({item}:{item:Message}) => {
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
          <View style={styles.inputWrapper}>
            <Mic/>

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
                color={inputText.trim() || isTyping ? '#FFFFFF' : '#CBD5E1'}
              />
            </TouchableOpacity>
          </View>
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
});

export default ChatScreen;
