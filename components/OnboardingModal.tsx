import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import {
  Globe,
  User,
  Phone,
  ShieldAlert,
  Camera,
  Check,
  ChevronRight,
  X,
  Heart,
  Sparkles,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAppTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  SUPPORTED_LANGUAGES,
  LanguageCode,
  getSelectedLanguage,
  setSelectedLanguage,
} from '../services/languageService';

const ONBOARDING_DONE_KEY = 'rakshak_onboarding_completed_v2';
const EMERGENCY_CONTACT_KEY = 'rakshak_emergency_contact_v1';

export function OnboardingModal() {
  const { colors, isDark } = useAppTheme();
  const { user, loginWithCredentials, saveUserSession } = useAuth() as any;

  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: Language
  const [selectedLang, setSelectedLangState] = useState<LanguageCode>('en');

  // Step 2: Login & Profile
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  useEffect(() => {
    // Check if onboarding has been completed
    if (typeof window !== 'undefined' && window.localStorage) {
      const isDone = window.localStorage.getItem(ONBOARDING_DONE_KEY);
      if (!isDone) {
        setSelectedLangState(getSelectedLanguage());
        setVisible(true);
      }
    }
  }, []);

  const handleSelectLang = (code: LanguageCode) => {
    setSelectedLangState(code);
    setSelectedLanguage(code);
  };

  const handlePickPhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.granted) {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
        if (!result.canceled && result.assets && result.assets[0]) {
          setPhotoUri(result.assets[0].uri);
        }
      }
    } catch (e) {
      console.warn('Image picker error:', e);
    }
  };

  const handleCompleteOnboarding = () => {
    // Save selected language
    setSelectedLanguage(selectedLang);

    // Save profile and emergency contact details if filled
    const emergencyData = {
      phone: userPhone,
      emergencyName,
      emergencyPhone,
      photoUri,
    };

    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(ONBOARDING_DONE_KEY, 'true');
      window.localStorage.setItem(EMERGENCY_CONTACT_KEY, JSON.stringify(emergencyData));
    }

    // Save into Auth user state if provided
    if (userName.trim()) {
      const newUserObj = {
        id: `usr-${Date.now()}`,
        name: userName.trim(),
        email: `${userName.toLowerCase().replace(/\s+/g, '')}@rakshak-user.in`,
        photoUrl: photoUri || '',
        role: 'user',
        roleTitle: 'Citizen Responder',
        phone: userPhone,
        emergencyContact: {
          name: emergencyName,
          phone: emergencyPhone,
        },
      };
      if (saveUserSession) saveUserSession(newUserObj);
    }

    setVisible(false);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleCompleteOnboarding}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? '#161C28' : '#FFFFFF',
              borderColor: isDark ? '#2D384E' : '#E2E8F0',
            },
          ]}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleRow}>
              <View style={[styles.iconCircle, { backgroundColor: colors.subPanel }]}>
                {step === 1 ? (
                  <Globe size={22} color={colors.steelBlue} />
                ) : (
                  <ShieldAlert size={22} color={colors.danger} />
                )}
              </View>
              <View>
                <Text style={[styles.stepBadge, { color: colors.steelBlue }]}>
                  STEP {step} OF 2
                </Text>
                <Text style={[styles.mainTitle, { color: colors.textPrimary }]}>
                  {step === 1 ? 'Choose Your Language' : 'Profile & Emergency Safety'}
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={handleCompleteOnboarding} style={styles.closeBtn}>
              <X size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* STEP 1: Regional Language Selection */}
          {step === 1 && (
            <View style={styles.stepContent}>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Which regional language are you most comfortable with? If not selected, English will be kept as default.
              </Text>

              <ScrollView style={styles.langList} showsVerticalScrollIndicator={false}>
                {SUPPORTED_LANGUAGES.map((item) => {
                  const isSelected = item.code === selectedLang;
                  return (
                    <TouchableOpacity
                      key={item.code}
                      style={[
                        styles.langItem,
                        {
                          backgroundColor: isSelected
                            ? isDark
                              ? '#1E293B'
                              : '#EFF6FF'
                            : isDark
                            ? '#0F172A'
                            : '#F8FAFC',
                          borderColor: isSelected ? colors.steelBlue : isDark ? '#334155' : '#E2E8F0',
                        },
                      ]}
                      onPress={() => handleSelectLang(item.code)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.flagText}>{item.flag}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.langName, { color: colors.textPrimary }]}>
                          {item.name === item.nativeName ? item.name : `${item.nativeName} (${item.name})`}
                        </Text>
                      </View>
                      {isSelected && <Check size={20} color={colors.steelBlue} />}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={[styles.skipBtn, { borderColor: colors.border }]}
                  onPress={() => {
                    handleSelectLang('en');
                    setStep(2);
                  }}
                >
                  <Text style={[styles.skipBtnText, { color: colors.textSecondary }]}>
                    Skip (Keep English)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.nextBtn, { backgroundColor: colors.steelBlue }]}
                  onPress={() => setStep(2)}
                >
                  <Text style={styles.nextBtnText}>Continue</Text>
                  <ChevronRight size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* STEP 2: Profile Photo & Emergency Contact Setup */}
          {step === 2 && (
            <View style={styles.stepContent}>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Enter your details & emergency contacts so family & NDRF rescue teams can reach you instantly. Photo can be added now or later!
              </Text>

              <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
                {/* Photo Upload Section */}
                <View style={styles.photoCenter}>
                  <TouchableOpacity
                    style={[
                      styles.photoCircle,
                      {
                        backgroundColor: isDark ? '#0F172A' : '#F1F5F9',
                        borderColor: isDark ? '#334155' : '#CBD5E1',
                      },
                    ]}
                    onPress={handlePickPhoto}
                  >
                    {photoUri ? (
                      <Image source={{ uri: photoUri }} style={styles.photoImg} />
                    ) : (
                      <View style={styles.photoPlaceholder}>
                        <Camera size={26} color={colors.steelBlue} />
                        <Text style={[styles.photoText, { color: colors.textMuted }]}>
                          Add Photo
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <Text style={[styles.photoSubText, { color: colors.textMuted }]}>
                    (Optional — can be added later)
                  </Text>
                </View>

                {/* Form Inputs */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Your Name</Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                        color: colors.textPrimary,
                        borderColor: isDark ? '#334155' : '#CBD5E1',
                      },
                    ]}
                    placeholder="Enter your name"
                    placeholderTextColor={colors.textMuted}
                    value={userName}
                    onChangeText={setUserName}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Your Phone Number</Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                        color: colors.textPrimary,
                        borderColor: isDark ? '#334155' : '#CBD5E1',
                      },
                    ]}
                    placeholder="Enter phone number"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="phone-pad"
                    value={userPhone}
                    onChangeText={setUserPhone}
                  />
                </View>

                <View style={styles.divider} />

                <View style={styles.emergencyHeader}>
                  <Heart size={16} color={colors.danger} />
                  <Text style={[styles.emergencyTitle, { color: colors.danger }]}>
                    Emergency Contact (Family / Friend)
                  </Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
                    Emergency Contact Name
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                        color: colors.textPrimary,
                        borderColor: isDark ? '#334155' : '#CBD5E1',
                      },
                    ]}
                    placeholder="Enter contact name"
                    placeholderTextColor={colors.textMuted}
                    value={emergencyName}
                    onChangeText={setEmergencyName}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
                    Emergency Contact Phone
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                        color: colors.textPrimary,
                        borderColor: isDark ? '#334155' : '#CBD5E1',
                      },
                    ]}
                    placeholder="Enter phone number"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="phone-pad"
                    value={emergencyPhone}
                    onChangeText={setEmergencyPhone}
                  />
                </View>
              </ScrollView>

              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={[styles.skipBtn, { borderColor: colors.border }]}
                  onPress={handleCompleteOnboarding}
                >
                  <Text style={[styles.skipBtnText, { color: colors.textSecondary }]}>
                    Skip for Now
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.nextBtn, { backgroundColor: colors.steelBlue }]}
                  onPress={handleCompleteOnboarding}
                >
                  <Text style={styles.nextBtnText}>Save & Finish</Text>
                  <Check size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '88%',
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 20,
    elevation: 20,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadge: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  stepContent: {
    flex: 1,
  },
  subtitle: {
    fontSize: 12.5,
    lineHeight: 18,
    marginBottom: 14,
  },
  langList: {
    maxHeight: 340,
    marginBottom: 14,
  },
  langItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  flagText: {
    fontSize: 22,
  },
  langName: {
    fontSize: 14,
    fontWeight: '800',
  },
  langRegion: {
    fontSize: 10.5,
    marginTop: 2,
  },
  formScroll: {
    maxHeight: 380,
    marginBottom: 14,
  },
  photoCenter: {
    alignItems: 'center',
    marginBottom: 16,
  },
  photoCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoImg: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoText: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  photoSubText: {
    fontSize: 11,
    marginTop: 6,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
    opacity: 0.3,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  emergencyTitle: {
    fontSize: 13,
    fontWeight: '900',
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 6,
  },
  skipBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  skipBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  nextBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
});
