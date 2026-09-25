import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image, Modal, ScrollView, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShieldAlert, PhoneCall, User, FlaskConical, Globe, Radio, Volume2, X, Check, Send } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ThemeToggleSwitch } from './ThemeToggleSwitch';
import { SUPPORTED_LANGUAGES, LanguageCode } from '../services/languageService';
import { executeVoiceCommand } from '../services/voiceCommandService';

interface HeaderProps {
  onRefresh?: () => void;
  isLive?: boolean;
}

export const Header: React.FC<HeaderProps> = () => {
  const { colors, isDark } = useAppTheme();
  const { user, isAuthenticated, currentRole } = useAuth();
  const { language, setLanguage, t, activeLangObj } = useLanguage();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const safeTop = Math.max(insets.top + (Platform.OS === 'ios' ? 6 : 8), Platform.OS === 'ios' ? 44 : Platform.OS === 'android' ? 32 : 18);

  const [showLangModal, setShowLangModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [voiceQueryText, setVoiceQueryText] = useState('');
  const [voiceResponse, setVoiceResponse] = useState<string>(t.responseShelters);

  const handleSelectLanguage = (code: LanguageCode) => {
    setLanguage(code);
    setShowLangModal(false);
  };

  const openVoiceAssistant = () => {
    setShowVoiceModal(true);
  };

  const handleExecuteCustomQuery = (query: string) => {
    if (!query.trim()) return;
    setVoiceQueryText('');
    const res = executeVoiceCommand(query, language);
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

          {/* AI Voice Assistant Hub */}
          <TouchableOpacity
            style={[
              styles.aiHubBtn,
              {
                backgroundColor: showVoiceModal ? colors.dangerBg : colors.subPanel,
                borderColor: showVoiceModal ? colors.dangerBorder : colors.border,
              },
            ]}
            onPress={openVoiceAssistant}
            activeOpacity={0.8}
          >
            <Radio size={16} color={showVoiceModal ? colors.danger : colors.steelBlue} />
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

      {/* Voice & AI Assistant Command Hub Modal */}
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
                  <Text style={[styles.voiceModalTitle, { color: colors.textPrimary }]}>{t.voiceAssistantTitle}</Text>
                  <Text style={[styles.voiceModalSubtitle, { color: colors.steelBlue }]}>{t.voiceAssistantSub}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setShowVoiceModal(false)} style={styles.closeBtn}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Spoken AI Response Box */}
            <View style={[styles.aiResponseBox, { backgroundColor: colors.subPanel, borderColor: colors.border }]}>
              <View style={styles.responseHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Volume2 size={16} color={colors.steelBlue} />
                  <Text style={[styles.responseLabel, { color: colors.steelBlue }]}>{t.aiSpokenResponse}</Text>
                </View>
                <TouchableOpacity onPress={() => executeVoiceCommand(voiceResponse, language)} style={styles.replayBtn}>
                  <Text style={[styles.replayText, { color: colors.steelBlue }]}>{t.replayAudio}</Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.responseTextContent, { color: colors.textPrimary }]}>
                {voiceResponse}
              </Text>
            </View>

            {/* Text Query Input Bar */}
            <View style={[styles.textInputRow, { backgroundColor: colors.subPanel, borderColor: colors.border }]}>
              <TextInput
                style={[styles.textInputStyle, { color: colors.textPrimary }]}
                placeholder={t.typeQuestionPlaceholder}
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
            <Text style={[styles.quickActionsTitle, { color: colors.textSecondary }]}>{t.quickCommandsTitle}</Text>
            <View style={styles.quickGrid}>
              <TouchableOpacity
                style={[styles.quickGridCard, { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder }]}
                onPress={() => handleExecuteCustomQuery('Help! Bachao! SOS Emergency')}
              >
                <Text style={styles.quickCardEmoji}>🚨</Text>
                <Text style={[styles.quickCardTitle, { color: colors.danger }]}>{t.cmdSosTitle}</Text>
                <Text style={[styles.quickCardDesc, { color: colors.danger }]}>{t.cmdSosDesc}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickGridCard, { backgroundColor: colors.subPanel, borderColor: colors.border }]}
                onPress={() => handleExecuteCustomQuery('Where are the nearest relief shelters?')}
              >
                <Text style={styles.quickCardEmoji}>🏠</Text>
                <Text style={[styles.quickCardTitle, { color: colors.textPrimary }]}>{t.cmdSheltersTitle}</Text>
                <Text style={[styles.quickCardDesc, { color: colors.textMuted }]}>{t.cmdSheltersDesc}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickGridCard, { backgroundColor: colors.subPanel, borderColor: colors.border }]}
                onPress={() => handleExecuteCustomQuery('What is the weather and rain forecast?')}
              >
                <Text style={styles.quickCardEmoji}>🌧️</Text>
                <Text style={[styles.quickCardTitle, { color: colors.textPrimary }]}>{t.cmdWeatherTitle}</Text>
                <Text style={[styles.quickCardDesc, { color: colors.textMuted }]}>{t.cmdWeatherDesc}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickGridCard, { backgroundColor: colors.subPanel, borderColor: colors.border }]}
                onPress={() => handleExecuteCustomQuery('Check highway road blockages and bypass routes')}
              >
                <Text style={styles.quickCardEmoji}>🛣️</Text>
                <Text style={[styles.quickCardTitle, { color: colors.textPrimary }]}>{t.cmdRoadTitle}</Text>
                <Text style={[styles.quickCardDesc, { color: colors.textMuted }]}>{t.cmdRoadDesc}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickGridCard, { backgroundColor: colors.subPanel, borderColor: colors.border }]}
                onPress={() => handleExecuteCustomQuery('Give me emergency disaster helplines')}
              >
                <Text style={styles.quickCardEmoji}>📞</Text>
                <Text style={[styles.quickCardTitle, { color: colors.textPrimary }]}>{t.cmdHelplinesTitle}</Text>
                <Text style={[styles.quickCardDesc, { color: colors.textMuted }]}>{t.cmdHelplinesDesc}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickGridCard, { backgroundColor: colors.subPanel, borderColor: colors.border }]}
                onPress={() => handleExecuteCustomQuery('Is the medical and food supply route clear?')}
              >
                <Text style={styles.quickCardEmoji}>🚑</Text>
                <Text style={[styles.quickCardTitle, { color: colors.textPrimary }]}>{t.cmdMedicalTitle}</Text>
                <Text style={[styles.quickCardDesc, { color: colors.textMuted }]}>{t.cmdMedicalDesc}</Text>
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
                const isSelected = item.code === language;
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
  aiHubBtn: {
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
  closeBtn: {
    padding: 4,
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
  aiResponseBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
    gap: 6,
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
  replayBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  replayText: {
    fontSize: 11,
    fontWeight: '700',
  },
  responseTextContent: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  textInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 14,
    gap: 8,
  },
  textInputStyle: {
    flex: 1,
    height: 38,
    fontSize: 12.5,
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionsTitle: {
    fontSize: 10.5,
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
