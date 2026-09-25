import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import {
  Bot,
  MessageSquare,
  X,
  Send,
  Sparkles,
  Trash2,
  ChevronDown,
  ShieldAlert,
  HelpCircle,
  PhoneCall,
  Navigation,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';
import { askGeminiChatbot, ChatMessage } from '../services/geminiService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSelectedLanguage, SUPPORTED_LANGUAGES } from '../services/languageService';

const SUGGESTED_QUESTIONS = [
  { label: '🚨 Helplines', query: 'What are the emergency contact numbers for landslide response?' },
  { label: '🛣️ NH-10 Corridor', query: 'What is the current safety status of the NH-10 Sevoke to Gangtok corridor?' },
  { label: '⚠️ Warning Signs', query: 'What are the critical early warning signs of an impending slope failure or landslide?' },
  { label: '📷 Live Reporting', query: 'How does live camera capture and AI verification work in this app?' },
];

export function GeminiChatbot() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const bottomOffset = Math.max(insets.bottom, Platform.OS === 'android' ? 14 : 10) + 84;
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const activeLangCode = getSelectedLanguage();
  const activeLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === activeLangCode) || SUPPORTED_LANGUAGES[0];

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        `Hey! 👋 **Welcome to LOGIX AI!**\n\nHow can I help you navigate North-East India logistics today? I'm your 24/7 smart transport accessibility assistant powered by Google Gemini. (Speaking in **${activeLangObj.name}**).\n\nAsk me about **highway status (NH-10, NH-6, NH-58)**, **disaster supply convoys**, **NDRF helplines**, or **landslide road disruptions**.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }
  }, [isOpen, messages]);

  const handleVoiceListen = () => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(`Voice speech recognition is not supported on this browser. Please type your query in ${activeLangObj.name}.`);
      return;
    }

    if (isVoiceListening) {
      setIsVoiceListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = activeLangObj.locale || 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsVoiceListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0]?.transcript;
        setIsVoiceListening(false);
        if (transcript) {
          setInputMessage(transcript);
          handleSendMessage(transcript);
        }
      };

      recognition.onerror = () => {
        setIsVoiceListening(false);
      };

      recognition.onend = () => {
        setIsVoiceListening(false);
      };

      recognition.start();
    } catch (e) {
      console.warn('Speech recognition error:', e);
      setIsVoiceListening(false);
    }
  };

  const handleSpeakMessage = (msgId: string, text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`~]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = activeLangObj.locale || 'en-US';
    utterance.rate = 0.95;

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputMessage).trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));

      const reply = await askGeminiChatbot(history, textToSend);

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.warn('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: "⚠️ I encountered an error reaching the Gemini network. Please check your connection and try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-fresh',
        role: 'assistant',
        content:
          "✨ **Chat cleared.** How can I assist you with geo-hazard monitoring, slope safety, or road status today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <View style={[styles.floatingContainer, { bottom: bottomOffset }]} pointerEvents="box-none">
      {/* 1. Chat Window Modal */}
      {isOpen && (
        <View
          style={[
            styles.chatWindow,
            {
              backgroundColor: isDark ? 'rgba(23, 30, 43, 0.96)' : 'rgba(255, 255, 255, 0.98)',
              borderColor: isDark ? '#2D3B4E' : '#E2E8F0',
              ...(Platform.OS === 'web'
                ? ({
                    backdropFilter: 'blur(16px)',
                    boxShadow: '0 12px 36px rgba(0, 0, 0, 0.28)',
                  } as any)
                : {}),
            },
          ]}
        >
          {/* Header */}
          <View style={[styles.chatHeader, { borderBottomColor: isDark ? '#2D3B4E' : '#E2E8F0' }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.avatarBadge, { backgroundColor: isDark ? '#1E293B' : '#EFF6FF' }]}>
                <Sparkles size={16} color="#3B82F6" />
              </View>
              <View>
                <View style={styles.titleRow}>
                  <Text style={[styles.chatTitle, { color: colors.textPrimary }]}>LOGIX AI</Text>
                  <View style={styles.onlineDot} />
                </View>
                <Text style={[styles.chatSubtitle, { color: colors.textMuted }]}>Gemini Flash Intelligence</Text>
              </View>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={handleClearChat}
                style={[styles.iconButton, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}
                accessibilityLabel="Clear chat"
              >
                <Trash2 size={14} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsOpen(false)}
                style={[styles.iconButton, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}
                accessibilityLabel="Close chat"
              >
                <ChevronDown size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Prompts Carousel */}
          <View style={[styles.chipsContainer, { borderBottomColor: isDark ? '#1F2937' : '#F3F4F6' }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
              {SUGGESTED_QUESTIONS.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                      borderColor: isDark ? '#334155' : '#E2E8F0',
                    },
                  ]}
                  onPress={() => handleSendMessage(item.query)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, { color: colors.steelBlue }]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Messages Scroll Area */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesScroll}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <View
                  key={msg.id}
                  style={[
                    styles.messageWrapper,
                    isUser ? styles.userMessageWrapper : styles.botMessageWrapper,
                  ]}
                >
                  {!isUser && (
                    <View style={[styles.botAvatar, { backgroundColor: isDark ? '#0F172A' : '#DBEAFE' }]}>
                      <Bot size={14} color="#3B82F6" />
                    </View>
                  )}
                  <View
                    style={[
                      styles.messageBubble,
                      isUser
                        ? [styles.userBubble, { backgroundColor: colors.steelBlue }]
                        : [
                            styles.botBubble,
                            {
                              backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                              borderColor: isDark ? '#334155' : '#E2E8F0',
                            },
                          ],
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        { color: isUser ? '#FFFFFF' : colors.textPrimary },
                      ]}
                      selectable
                    >
                      {msg.content}
                    </Text>
                    <View style={styles.msgFooterRow}>
                      {!isUser && (
                        <TouchableOpacity
                          onPress={() => handleSpeakMessage(msg.id, msg.content)}
                          style={styles.speakerBtn}
                        >
                          {speakingMsgId === msg.id ? (
                            <VolumeX size={13} color={colors.steelBlue} />
                          ) : (
                            <Volume2 size={13} color={colors.textMuted} />
                          )}
                        </TouchableOpacity>
                      )}
                      <Text
                        style={[
                          styles.timestampText,
                          { color: isUser ? 'rgba(255,255,255,0.7)' : colors.textMuted },
                        ]}
                      >
                        {msg.timestamp}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}

            {isLoading && (
              <View style={[styles.messageWrapper, styles.botMessageWrapper]}>
                <View style={[styles.botAvatar, { backgroundColor: isDark ? '#0F172A' : '#DBEAFE' }]}>
                  <Bot size={14} color="#3B82F6" />
                </View>
                <View
                  style={[
                    styles.messageBubble,
                    styles.botBubble,
                    {
                      backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                      borderColor: isDark ? '#334155' : '#E2E8F0',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                    },
                  ]}
                >
                  <ActivityIndicator size="small" color={colors.steelBlue} />
                  <Text style={[styles.thinkingText, { color: colors.textSecondary }]}>
                    GeoShield AI analyzing...
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Input Bar */}
          <View style={[styles.inputBar, { borderTopColor: isDark ? '#2D3B4E' : '#E2E8F0', backgroundColor: isDark ? '#171E2B' : '#FFFFFF' }]}>
            {/* Regional Voice Mic Button */}
            <TouchableOpacity
              style={[
                styles.voiceMicBtn,
                {
                  backgroundColor: isVoiceListening ? colors.dangerBg : isDark ? '#0F172A' : '#F1F5F9',
                  borderColor: isVoiceListening ? colors.dangerBorder : isDark ? '#334155' : '#CBD5E1',
                },
              ]}
              onPress={handleVoiceListen}
              activeOpacity={0.8}
            >
              {isVoiceListening ? (
                <Mic size={16} color={colors.danger} />
              ) : (
                <MicOff size={16} color={colors.steelBlue} />
              )}
            </TouchableOpacity>

            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                  color: colors.textPrimary,
                  borderColor: isDark ? '#334155' : '#CBD5E1',
                },
              ]}
              placeholder={`Ask GeoShield AI in ${activeLangObj.name}...`}
              placeholderTextColor={colors.textMuted}
              value={inputMessage}
              onChangeText={setInputMessage}
              onSubmitEditing={() => handleSendMessage()}
              returnKeyType="send"
              multiline={false}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                {
                  backgroundColor: inputMessage.trim() ? colors.steelBlue : isDark ? '#334155' : '#CBD5E1',
                },
              ]}
              onPress={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              activeOpacity={0.8}
            >
              <Send size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Floating Greeting Speech Bubble Badge above Chatbot */}
      {!isOpen && (
        <TouchableOpacity
          style={[
            styles.greetingBubble,
            {
              backgroundColor: colors.cardBg,
              borderColor: colors.border,
            },
          ]}
          onPress={() => setIsOpen(true)}
          activeOpacity={0.85}
        >
          <Sparkles size={13} color={colors.steelBlue} />
          <Text style={[styles.greetingBubbleText, { color: colors.textPrimary }]}>
            Hey! 👋 Ask LOGIX AI
          </Text>
          <View style={[styles.bubbleTriangle, { borderTopColor: colors.cardBg }]} />
        </TouchableOpacity>
      )}

      {/* 2. Floating Toggle Button */}
      <TouchableOpacity
        style={[
          styles.fabButton,
          {
            backgroundColor: isOpen ? '#EF4444' : colors.steelBlue,
            ...(Platform.OS === 'web'
              ? ({
                  boxShadow: '0 8px 24px rgba(59, 130, 246, 0.45)',
                  cursor: 'pointer',
                } as any)
              : {}),
          },
        ]}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.85}
        accessibilityLabel="Toggle Gemini AI Assistant"
      >
        {isOpen ? (
          <X size={24} color="#FFFFFF" />
        ) : (
          <View style={styles.fabInner}>
            <Bot size={24} color="#FFFFFF" />
            <View style={styles.fabBadge} />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    right: 18,
    zIndex: 9999,
    alignItems: 'flex-end',
  },
  greetingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    position: 'relative',
  },
  greetingBubbleText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  bubbleTriangle: {
    position: 'absolute',
    bottom: -6,
    right: 18,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  fabButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
  },
  fabInner: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  chatWindow: {
    width: 370,
    maxWidth: '92vw' as any,
    height: 520,
    maxHeight: '78vh' as any,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
    flexDirection: 'column',
    elevation: 12,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chatTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  chatSubtitle: {
    fontSize: 11,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipsContainer: {
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  chipsScroll: {
    paddingHorizontal: 12,
    gap: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    padding: 14,
    gap: 12,
  },
  messageWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  userMessageWrapper: {
    justifyContent: 'flex-end',
  },
  botMessageWrapper: {
    justifyContent: 'flex-start',
  },
  botAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  messageBubble: {
    maxWidth: '82%',
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 16,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  botBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 13.5,
    lineHeight: 19,
  },
  msgFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  speakerBtn: {
    padding: 2,
  },
  timestampText: {
    fontSize: 10,
    alignSelf: 'flex-end',
  },
  thinkingText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  voiceMicBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 13,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
