import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image, Modal, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShieldAlert, PhoneCall, User, FlaskConical, Globe, Mic, MicOff, Volume2, X, Check } from 'lucide-react-native';
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

  // Ensure ample top padding so header never clashes with phone status bar / dynamic island notch
  const safeTop = Math.max(insets.top + (Platform.OS === 'ios' ? 6 : 8), Platform.OS === 'ios' ? 44 : Platform.OS === 'android' ? 32 : 18);

  const [currentLang, setCurrentLangState] = useState<LanguageCode>('en');
  const [showLangModal, setShowLangModal] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);

  useEffect(() => {
    setCurrentLangState(getSelectedLanguage());
  }, []);

  const t = getTranslations(currentLang);
  const activeLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  const handleSelectLanguage = (code: LanguageCode) => {
    setSelectedLanguage(code);
    setCurrentLangState(code);
    setShowLangModal(false);
  };

  const handleToggleVoiceAssistant = () => {
    if (isListening) {
      setIsListening(false);
      setVoiceFeedback(null);
      return;
    }

    setIsListening(true);
    setVoiceFeedback(t.listeningVoice);

    listenForVoiceCommand(
      (result: VoiceRecognitionResult) => {
        setIsListening(false);
        setVoiceFeedback(`📢 ${result.feedbackResponse}`);
        setTimeout(() => setVoiceFeedback(null), 6000);
      },
      (status) => {
        if (status === 'stopped' || status === 'error') {
          setIsListening(false);
        }
      }
    );
  };

  return (
    <View style={[styles.header, { backgroundColor: colors.cardBg, borderBottomColor: colors.border, paddingTop: safeTop }]}>
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
              backgroundColor: isListening ? colors.dangerBg : colors.subPanel,
              borderColor: isListening ? colors.dangerBorder : colors.border,
            },
          ]}
          onPress={handleToggleVoiceAssistant}
          activeOpacity={0.8}
        >
          {isListening ? (
            <Mic size={15} color={colors.danger} />
          ) : (
            <MicOff size={14} color={colors.steelBlue} />
          )}
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

      {/* Voice Assistant Feedback Banner */}
      {voiceFeedback ? (
        <View style={[styles.voiceFeedbackBanner, { backgroundColor: colors.steelBlue, borderColor: colors.border }]}>
          <Volume2 size={16} color="#ffffff" />
          <Text style={styles.voiceFeedbackText}>{voiceFeedback}</Text>
          <TouchableOpacity onPress={() => setVoiceFeedback(null)}>
            <X size={14} color="#ffffff" />
          </TouchableOpacity>
        </View>
      ) : null}

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
  header: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    zIndex: 100,
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
  voiceFeedbackBanner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 6,
    gap: 8,
  },
  voiceFeedbackText: {
    flex: 1,
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
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
