import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image, Modal, ScrollView, TextInput, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShieldAlert, PhoneCall, User, FlaskConical, Globe, Mic, MicOff, Volume2, X, Check, Send, Sparkles, Navigation, CloudRain, Shield, AlertTriangle, Home, Radio } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { ThemeToggleSwitch } from './ThemeToggleSwitch';
import {
  SUPPORTED_LANGUAGES,
  LanguageCode,
  getSelectedLanguage,
  setSelectedLanguage,
  getTranslations,
} from '../services/languageService';
import {
  listenForVoiceCommand,
  stopActiveVoiceRecognition,
  executeVoiceCommand,
  VoiceRecognitionResult,
} from '../services/voiceCommandService';

interface HeaderProps {
  onRefresh?: () => void;
  isLive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onRefresh }) => {
  const { colors, isDark } = useAppTheme();
  const { user, isAuthenticated, currentRole } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const safeTop = Math.max(insets.top + (Platform.OS === 'ios' ? 6 : 8), Platform.OS === 'ios' ? 44 : Platform.OS === 'android' ? 32 : 18);

  const [currentLang, setCurrentLangState] = useState<LanguageCode>('en');
  const [showLangModal, setShowLangModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceQueryText, setVoiceQueryText] = useState('');
  const [voiceResponse, setVoiceResponse] = useState<string | null>(null);
  const [voiceStatusNotice, setVoiceStatusNotice] = useState<string | null>(null);
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    setCurrentLangState(getSelectedLanguage());
  }, []);

  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  const t = getTranslations(currentLang);
  const activeLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  const handleSelectLanguage = (code: LanguageCode) => {
    setSelectedLanguage(code);
    setCurrentLangState(code);
    setShowLangModal(false);
  };

  const openVoiceAssistant = () => {
    setShowVoiceModal(true);
    startListening();
  };

  const startListening = () => {
    setIsListening(true);
    setVoiceStatusNotice('Listening... Speak clearly into your microphone.');

    listenForVoiceCommand(
      (result: VoiceRecognitionResult) => {
        setIsListening(false);
        setVoiceStatusNotice(null);
        setVoiceResponse(result.feedbackResponse);
      },
      (status, errorMsg) => {
        if (status === 'error') {
          setIsListening(false);
          setVoiceStatusNotice(errorMsg || 'Microphone offline. Type or tap an option below.');
        } else if (status === 'stopped') {
          setIsListening(false);
          setVoiceStatusNotice(null);
        } else if (status === 'listening') {
          setIsListening(true);
          setVoiceStatusNotice('🎙️ Listening... Speak your query.');
        }
      }
    );
  };

  const handleStopListening = () => {
    stopActiveVoiceRecognition();
    setIsListening(false);
    setVoiceStatusNotice(null);
  };

  const handleExecuteCustomQuery = (query: string) => {
    if (!query.trim()) return;
    handleStopListening();
    setVoiceQueryText('');
    const res = executeVoiceCommand(query, (r) => {
      setVoiceResponse(r.feedbackResponse);
    });
    setVoiceResponse(res.feedbackResponse);
  };

  return (
    <View style={[styles.headerContainer, { backgroundColor: colors.cardBg, borderBottomColor: colors.border, paddingTop: safeTop }]}>
      {/* Top Main Navigation Row */}
      <View style={styles.headerTopRow}>
        <View style={styles.titleContainer}>
          <View style={styles.logoRow}>
            <View style={[styles.shieldIconWrapper, { backgroundColor: colors.subPanel, borderColor: colors.border }]}>
              <ShieldAlert size={16} color={colors.steelBlue} />
            </View>
            <View style={styles.titleTextCol}>
              <Text style={[styles.appTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                {t.appTitle}
              </Text>
              <Text style={[styles.appSubtitle, { color: colors.steelBlue }]} numberOfLines={1}>
                {t.appSubtitle}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actionRow}>
          {/* Seven Sisters Language Selector */}
          <TouchableOpacity
            style={[styles.langBtn, { backgroundColor: colors.subPanel, borderColor: colors.border }]}
            onPress={() => setShowLangModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.langFlag}>{activeLangObj.flag}</Text>
            <Text style={[styles.langCodeText, { color: colors.textPrimary }]}>{activeLangObj.code.toUpperCase()}</Text>
          </TouchableOpacity>

          {/* Multi-Lingual Voice AI Mic Assistant */}
          <TouchableOpacity
            style={[
              styles.micBtn,
              {
                backgroundColor: showVoiceModal ? colors.dangerBg : colors.subPanel,
                borderColor: showVoiceModal ? colors.dangerBorder : colors.border,
              },
            ]}
            onPress={openVoiceAssistant}
            activeOpacity={0.8}
          >
            <Mic size={15} color={showVoiceModal ? colors.danger : colors.steelBlue} />
          </TouchableOpacity>

          {/* Theme Switcher */}
          <View style={{ width: 46, height: 26, justifyContent: 'center', alignItems: 'center' }}>
            <ThemeToggleSwitch scale={0.7} />
          </View>

          {/* Helpline Button */}
          <TouchableOpacity
            style={[styles.helplineButton, { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder }]}
            onPress={() => router.push('/modal')}
            activeOpacity={0.8}
          >
            <PhoneCall size={12} color={colors.danger} />
            <Text style={[styles.helplineText, { color: colors.danger }]}>1078</Text>
          </TouchableOpacity>

          {/* User Avatar / Login Shortcut */}
          <TouchableOpacity
            style={[
              styles.userButton,
              {
                backgroundColor:
                  currentRole === 'admin'
                    ? colors.dangerBg
                    : currentRole === 'tester'
                    ? colors.warningBg
                    : colors.subPanel,
                borderColor:
                  currentRole === 'admin'
                    ? colors.dangerBorder
                    : currentRole === 'tester'
                    ? colors.warningBorder
                    : colors.border,
              },
            ]}
            onPress={() => router.push('/(tabs)/settings')}
            activeOpacity={0.8}
          >
            {isAuthenticated && currentRole === 'admin' ? (
              <ShieldAlert size={15} color={colors.danger} />
            ) : isAuthenticated && currentRole === 'tester' ? (
              <FlaskConical size={15} color={colors.warning} />
            ) : isAuthenticated && user?.photoUrl ? (
              <Image source={{ uri: user.photoUrl }} style={styles.userAvatarImg} />
            ) : (
              <User size={14} color={colors.steelBlue} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Voice Assistant Interactive Modal */}
      <Modal visible={showVoiceModal} transparent animationType="fade" onRequestClose={() => setShowVoiceModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.voiceModalCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            {/* Modal Header */}
            <View style={styles.voiceModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={[styles.voiceModalIconWrap, { backgroundColor: colors.subPanel, borderColor: colors.border }]}>
                  <Radio size={18} color={colors.steelBlue} />
                </View>
                <View>
                  <Text style={[styles.voiceModalTitle, { color: colors.textPrimary }]}>LOGIX Voice AI Assistant</Text>
                  <Text style={[styles.voiceModalSubtitle, { color: colors.steelBlue }]}>Seven Sisters Regional Grid</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => { handleStopListening(); setShowVoiceModal(false); }}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Central Animated Mic Button */}
            <View style={styles.micCenterArea}>
              <Animated.View style={[styles.micBigPulseCircle, { transform: [{ scale: pulseAnim }], borderColor: isListening ? colors.danger : colors.steelBlue }]}>
                <TouchableOpacity
                  style={[
                    styles.micBigButton,
                    { backgroundColor: isListening ? colors.danger : colors.steelBlue },
                  ]}
                  onPress={isListening ? handleStopListening : startListening}
                  activeOpacity={0.85}
                >
                  {isListening ? <Mic size={32} color="#ffffff" /> : <MicOff size={30} color="#ffffff" />}
                </TouchableOpacity>
              </Animated.View>
              <Text style={[styles.micStatusLabel, { color: isListening ? colors.danger : colors.textPrimary }]}>
                {isListening ? 'Listening for speech...' : 'Tap Mic to Speak'}
              </Text>
              {voiceStatusNotice && (
                <Text style={[styles.voiceNoticeText, { color: colors.textSecondary }]}>
                  {voiceStatusNotice}
                </Text>
              )}
            </View>

            {/* Spoken AI Response Box */}
            {voiceResponse && (
              <View style={[styles.aiResponseBox, { backgroundColor: colors.subPanel, borderColor: colors.border }]}>
                <View style={styles.responseHeaderRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Volume2 size={16} color={colors.steelBlue} />
                    <Text style={[styles.responseLabel, { color: colors.steelBlue }]}>AI Spoken Response</Text>
                  </View>
                  <TouchableOpacity onPress={() => executeVoiceCommand(voiceResponse)}>
                    <Text style={[styles.replayText, { color: colors.steelBlue }]}>🔊 Replay</Text>
                  </TouchableOpacity>
                </View>
                <Text style={[styles.responseTextContent, { color: colors.textPrimary }]}>
                  {voiceResponse}
                </Text>
              </View>
            )}

            {/* Text Query Input Bar */}
            <View style={[styles.textInputRow, { backgroundColor: colors.subPanel, borderColor: colors.border }]}>
              <TextInput
                style={[styles.textInputStyle, { color: colors.textPrimary }]}
                placeholder="Or type a question (e.g. Shelters, Weather)..."
                placeholderTextColor={colors.textMuted}
                value={voiceQueryText}
                onChangeText={setVoiceQueryText}
                onSubmitEditing={() => handleExecuteCustomQuery(voiceQueryText)}
                returnKeyType="send"
              />
              <TouchableOpacity
                style={[styles.sendBtn, { backgroundColor: colors.steelBlue }]}
                onPress={() => handleExecuteCustomQuery(voiceQueryText)}
              >
                <Send size={15} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Instant Action Grid */}
            <Text style={[styles.quickActionsTitle, { color: colors.textSecondary }]}>QUICK VOICE COMMANDS:</Text>
            <View style={styles.quickGrid}>
              <TouchableOpacity
                style={[styles.quickGridCard, { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder }]}
                onPress={() => handleExecuteCustomQuery('Help! Bachao! SOS Emergency')}
              >
                <Text style={styles.quickCardEmoji}>🚨</Text>
                <Text style={[styles.quickCardTitle, { color: colors.danger }]}>Emergency SOS</Text>
                <Text style={[styles.quickCardDesc, { color: colors.danger }]}>Siren + GPS Broadcast</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickGridCard, { backgroundColor: colors.subPanel, borderColor: colors.border }]}
                onPress={() => handleExecuteCustomQuery('Where are the nearest relief shelters?')}
              >
                <Text style={styles.quickCardEmoji}>🏠</Text>
                <Text style={[styles.quickCardTitle, { color: colors.textPrimary }]}>Relief Shelters</Text>
                <Text style={[styles.quickCardDesc, { color: colors.textMuted }]}>Nearest Safe Camps</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickGridCard, { backgroundColor: colors.subPanel, borderColor: colors.border }]}
                onPress={() => handleExecuteCustomQuery('What is the weather and rain forecast?')}
              >
                <Text style={styles.quickCardEmoji}>🌧️</Text>
                <Text style={[styles.quickCardTitle, { color: colors.textPrimary }]}>Monsoon Weather</Text>
                <Text style={[styles.quickCardDesc, { color: colors.textMuted }]}>Rainfall & Saturation</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickGridCard, { backgroundColor: colors.subPanel, borderColor: colors.border }]}
                onPress={() => handleExecuteCustomQuery('Check highway road blockages and bypass routes')}
              >
                <Text style={styles.quickCardEmoji}>🛣️</Text>
                <Text style={[styles.quickCardTitle, { color: colors.textPrimary }]}>Road & Bypass</Text>
                <Text style={[styles.quickCardDesc, { color: colors.textMuted }]}>NH-10 Lava Diversion</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Seven Sisters Language Selection Modal */}
      <Modal visible={showLangModal} transparent animationType="fade" onRequestClose={() => setShowLangModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Globe size={20} color={colors.steelBlue} />
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Seven Sisters Languages</Text>
              </View>
              <TouchableOpacity onPress={() => setShowLangModal(false)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
              Select your regional North East India language for UI translations & voice panic commands:
            </Text>

            <ScrollView style={styles.langList} showsVerticalScrollIndicator={false}>
              {SUPPORTED_LANGUAGES.map((item) => {
                const isSelected = item.code === currentLang;
                return (
                  <TouchableOpacity
                    key={item.code}
                    style={[
                      styles.langOptionItem,
                      {
                        backgroundColor: isSelected ? colors.subPanel : colors.cardBg,
                        borderColor: isSelected ? colors.steelBlue : colors.borderSoft,
                      },
                    ]}
                    onPress={() => handleSelectLanguage(item.code)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.langOptionFlag}>{item.flag}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.langOptionName, { color: colors.textPrimary }]}>
                        {item.name} ({item.nativeName})
                      </Text>
                      <Text style={[styles.langOptionRegion, { color: colors.textMuted }]}>
                        Region: {item.region}
                      </Text>
                    </View>
                    {isSelected && <Check size={18} color={colors.steelBlue} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    flexDirection: 'column',
    elevation: 4,
    zIndex: 100,
  },
  headerTopRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  titleContainer: {
    flex: 1,
    minWidth: 0,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  titleTextCol: {
    flex: 1,
    minWidth: 0,
  },
  shieldIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  appTitle: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  appSubtitle: {
    fontSize: 9.5,
    fontWeight: '700',
    marginTop: 1,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexShrink: 0,
  },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  langFlag: {
    fontSize: 14,
  },
  langCodeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  micBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helplineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  helplineText: {
    fontSize: 11,
    fontWeight: '800',
  },
  userButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  userAvatarImg: {
    width: '100%',
    height: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  voiceModalCard: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  voiceModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  voiceModalIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceModalTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  voiceModalSubtitle: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  micCenterArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  micBigPulseCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  micBigButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  micStatusLabel: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  voiceNoticeText: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 12,
  },
  aiResponseBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    gap: 4,
  },
  responseHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  responseLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  replayText: {
    fontSize: 11,
    fontWeight: '700',
  },
  responseTextContent: {
    fontSize: 12.5,
    fontWeight: '700',
    lineHeight: 18,
  },
  textInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12,
    gap: 8,
  },
  textInputStyle: {
    flex: 1,
    height: 38,
    fontSize: 12,
  },
  sendBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionsTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickGridCard: {
    width: '48%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    gap: 2,
  },
  quickCardEmoji: {
    fontSize: 18,
    marginBottom: 2,
  },
  quickCardTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  quickCardDesc: {
    fontSize: 9.5,
    fontWeight: '600',
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '80%',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  modalSub: {
    fontSize: 11.5,
    marginBottom: 12,
    lineHeight: 16,
  },
  langList: {
    maxHeight: 380,
  },
  langOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  langOptionFlag: {
    fontSize: 22,
  },
  langOptionName: {
    fontSize: 13,
    fontWeight: '800',
  },
  langOptionRegion: {
    fontSize: 10,
    marginTop: 2,
  },
});
