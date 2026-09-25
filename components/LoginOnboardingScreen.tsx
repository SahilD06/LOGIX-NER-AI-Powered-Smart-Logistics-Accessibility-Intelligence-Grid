import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ShieldAlert,
  Globe,
  User,
  Phone,
  Calendar,
  Heart,
  MapPin,
  Navigation,
  Volume2,
  Camera,
  Check,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Sparkles,
  X,
  AlertTriangle,
  ShieldCheck,
  Award,
  LogIn,
  RefreshCw,
  Droplet,
  Smartphone,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAppTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  SUPPORTED_LANGUAGES,
  LanguageCode,
  getSelectedLanguage,
  setSelectedLanguage,
  getTranslations,
} from '../services/languageService';
import { requestUserLocationWithChoice, UserLocation } from '../services/locationService';
import { requestNotificationPermission } from '../services/notificationService';
import { addEmergencyContact } from '../services/emergencyContactsService';
import { ThemeToggleSwitch } from './ThemeToggleSwitch';
import { formatBirthdateDisplay, formatBirthdateInputMask } from '../utils/dateFormatters';
import Svg, { Path } from 'react-native-svg';


export const GoogleLogoIcon = ({ size = 18 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <Path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <Path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <Path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </Svg>
);

const PRESET_AVATARS = [
  {
    label: 'Citizen Scout',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  },
  {
    label: 'Field Ranger',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
  {
    label: 'Mountain Guide',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    label: 'NDRF Guard',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
];

const BLOOD_GROUPS = ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'];

const RELATIONSHIPS = [
  'Parent',
  'Spouse',
  'Sibling',
  'Child',
  'Close Friend',
  'Local Guardian',
];

const MOUNTAIN_SECTORS = [
  'East Khasi Hills • Shillong Sector',
  'Gangtok • Sevoke NH-10 Corridor',
  'Kohima • Dimapur NH-29 Pass',
  'Aizawl • Lunglei Sector',
  'Guwahati • Kamrup Valley',
  'Imphal • Senapati Highway',
  'Agartala • Jampui Hills',
  'Itanagar • Tawang Pass',
];

export function LoginOnboardingScreen() {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const safeTop = Math.max(insets.top + (Platform.OS === 'ios' ? 6 : 8), Platform.OS === 'ios' ? 44 : Platform.OS === 'android' ? 36 : 18);

  const {
    signInWithGoogle,
    loginWithGoogleProfile,
    loginWithCredentials,
    loginAsRole,
    completeOnboarding,
    isLoading: isAuthLoading,
  } = useAuth();

  // Mode: 'onboarding' (guided multi-step) vs 'signin' (returning user)
  const [mode, setMode] = useState<'onboarding' | 'signin'>('onboarding');

  // Step state for Onboarding (1 to 6)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // STEP 1: Regional Language Selection
  const [selectedLang, setSelectedLangState] = useState<LanguageCode>(getSelectedLanguage());

  // STEP 2: Account Creation & Credentials
  const [accountEmail, setAccountEmail] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // STEP 3: Personal Profile Details
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [birthdate, setBirthdate] = useState('');
<<<<<<< HEAD
  const [bloodGroup, setBloodGroup] = useState('');
  const [photoUri, setPhotoUri] = useState<string>('');
=======
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [pickerDay, setPickerDay] = useState<number>(2);
  const [pickerMonth, setPickerMonth] = useState<number>(2);
  const [pickerYear, setPickerYear] = useState<number>(2006);
  const [bloodGroup, setBloodGroup] = useState('O+');

  const [photoUri, setPhotoUri] = useState<string>(PRESET_AVATARS[0].url);
>>>>>>> 2911609 (fix(birthdate): add interactive calendar date picker modal and date display formatting)

  // STEP 4: Precise GPS Location & Alerts
  const [isLocating, setIsLocating] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedSectorFallback, setSelectedSectorFallback] = useState(MOUNTAIN_SECTORS[0]);
  const [locationError, setLocationError] = useState('');
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  // STEP 5: Emergency Safety Contact
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');

  // SIGN IN MODE STATE
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [signInError, setSignInError] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Translations
  const t = getTranslations(selectedLang);

  useEffect(() => {
    setSelectedLangState(getSelectedLanguage());
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const pendingStr = window.sessionStorage.getItem('pending_onboarding_google_user');
      if (pendingStr) {
        try {
          const pending = JSON.parse(pendingStr);
          window.sessionStorage.removeItem('pending_onboarding_google_user');
          if (pending.name) setFullName(pending.name);
          if (pending.email) setAccountEmail(pending.email);
          if (pending.photoUrl) setPhotoUri(pending.photoUrl);
          setCurrentStep(3);
        } catch {}
      }
    }
  }, []);

  const handleSelectLanguage = (code: LanguageCode) => {
    setSelectedLangState(code);
    setSelectedLanguage(code);
  };

  // Image picker handler
  const handlePickPhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.granted) {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.85,
        });
        if (!result.canceled && result.assets && result.assets[0]) {
          setPhotoUri(result.assets[0].uri);
        }
      }
    } catch (e) {
      console.warn('Image picker error:', e);
    }
  };

  // Real Google Sign-In button click
  const handleGoogleBtnPress = async () => {
    setIsSigningIn(true);
    setSignInError('');
    try {
      await signInWithGoogle(false);
    } catch (e: any) {
      setSignInError('Google sign in error. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  // Precise Location Request
  const handleRequestPreciseLocation = async () => {
    setIsLocating(true);
    setLocationError('');
    try {
      const loc = await requestUserLocationWithChoice('precise');
      setUserLocation(loc);
      if (loc.locationName) {
        setSelectedSectorFallback(loc.locationName);
      }
    } catch (e) {
      setLocationError('Could not determine exact GPS coordinates. Using default corridor.');
    } finally {
      setIsLocating(false);
    }
  };

  // Notification Permission Request
  const handleToggleNotifications = async () => {
    try {
      const perm = await requestNotificationPermission();
      if (perm === 'granted') {
        setNotificationEnabled(true);
      } else {
        setNotificationEnabled(false);
      }
    } catch {
      setNotificationEnabled(false);
    }
  };

  // Handle Returning User Sign In
  const handleReturningSignIn = async () => {
    if (!loginUsername.trim() || !loginPassword.trim()) {
      setSignInError('Please enter both username/email and password.');
      return;
    }
    setSignInError('');
    setIsSigningIn(true);
    const res = await loginWithCredentials(loginUsername, loginPassword);
    setIsSigningIn(false);
    if (!res.success) {
      setSignInError(res.message || 'Invalid username or password.');
    }
  };

  // Handle Quick Demo Login
  const handleDemoLogin = async (role: 'user' | 'admin' | 'tester') => {
    setIsSigningIn(true);
    await loginAsRole(role);
    setIsSigningIn(false);
  };

  // Handle Finish Onboarding & App Entry
  const handleCompleteOnboarding = async () => {
    if (emergencyName.trim() && emergencyPhone.trim()) {
      addEmergencyContact(emergencyName, emergencyPhone, emergencyRelation);
    }

    const finalName = fullName.trim() || 'Citizen Responder';
    const finalEmail = accountEmail.trim() || `${finalName.toLowerCase().replace(/\s+/g, '')}@rakshak.in`;
    const finalLocation = userLocation
      ? {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          locationName: userLocation.locationName,
          isPrecise: userLocation.isLiveGps,
        }
      : {
          latitude: 25.5788,
          longitude: 91.8933,
          locationName: selectedSectorFallback,
          isPrecise: false,
        };

    await completeOnboarding({
      name: finalName,
      email: finalEmail,
      photoUrl: photoUri,
      phone: phoneNumber.trim(),
      birthdate: birthdate.trim(),
      bloodGroup,
      role: 'user',
      location: finalLocation,
      emergencyContact: emergencyName.trim()
        ? {
            name: emergencyName.trim(),
            phone: emergencyPhone.trim(),
            relation: emergencyRelation,
          }
        : undefined,
      preferredLanguage: selectedLang,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Top App Branding Bar - Matches Header.tsx safe area */}
      <View style={[styles.topBar, { backgroundColor: colors.cardBg, borderBottomColor: colors.border, paddingTop: safeTop }]}>
        <View style={styles.brandRow}>
          <View style={[styles.shieldIconWrapper, { backgroundColor: colors.subPanel, borderColor: colors.border }]}>
            <ShieldAlert size={18} color={colors.steelBlue} />
          </View>
          <View style={styles.brandTitleCol}>
            <View style={styles.brandTitleRow}>
              <Text style={[styles.appTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                {t.appTitle}
              </Text>
            </View>
            <Text style={[styles.appSubtitle, { color: colors.steelBlue }]} numberOfLines={1}>
              {t.appSubtitle}
            </Text>
          </View>
        </View>

        <View style={{ width: 46, height: 26, justifyContent: 'center', alignItems: 'center' }}>
          <ThemeToggleSwitch scale={0.7} />
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Mode Switcher Tabs */}
        <View style={styles.modeContainer}>
          <View
            style={[
              styles.modeSegment,
              {
                backgroundColor: colors.subPanel,
                borderColor: colors.border,
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.modeTab,
                mode === 'onboarding' && [
                  styles.modeTabActive,
                  { backgroundColor: colors.cardBg, borderColor: colors.border },
                ],
              ]}
              onPress={() => setMode('onboarding')}
              activeOpacity={0.8}
            >
              <Sparkles size={14} color={mode === 'onboarding' ? colors.steelBlue : colors.textMuted} />
              <Text
                style={[
                  styles.modeTabText,
                  { color: mode === 'onboarding' ? colors.textPrimary : colors.textMuted },
                ]}
              >
                New Citizen Setup
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeTab,
                mode === 'signin' && [
                  styles.modeTabActive,
                  { backgroundColor: colors.cardBg, borderColor: colors.border },
                ],
              ]}
              onPress={() => setMode('signin')}
              activeOpacity={0.8}
            >
              <LogIn size={14} color={mode === 'signin' ? colors.steelBlue : colors.textMuted} />
              <Text
                style={[
                  styles.modeTabText,
                  { color: mode === 'signin' ? colors.textPrimary : colors.textMuted },
                ]}
              >
                Sign In (Existing)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Responsive Card */}
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 380 }]}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.cardBg,
              borderColor: colors.border,
            },
          ]}
        >
          {/* ========================================================================= */}
          {/* MODE: SIGN IN (RETURNING USER) */}
          {/* ========================================================================= */}
          {mode === 'signin' && (
            <View style={styles.contentWrapper}>
              <View style={styles.stepHeader}>
                <View style={[styles.stepIconBubble, { backgroundColor: colors.subPanel, borderColor: colors.border }]}>
                  <LogIn size={20} color={colors.steelBlue} />
                </View>
                <View style={styles.stepHeaderCol}>
                  <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>Welcome Back</Text>
                  <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
                    Sign in to access live radar telemetry, route alerts, and NDRF dispatches.
                  </Text>
                </View>
              </View>

              {/* Real Google Sign-In Button */}
              <TouchableOpacity
                style={[styles.googleBtn, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
                onPress={handleGoogleBtnPress}
                disabled={isSigningIn}
                activeOpacity={0.85}
              >
                {isSigningIn ? (
                  <ActivityIndicator size="small" color={colors.steelBlue} />
                ) : (
                  <>
                    <GoogleLogoIcon size={18} />
                    <Text style={[styles.googleBtnText, { color: colors.textPrimary }]}>
                      Continue with Google
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                <Text style={[styles.dividerText, { color: colors.textMuted }]}>OR SIGN IN WITH USERNAME</Text>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              </View>

              {signInError ? (
                <View style={[styles.errorBanner, { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder }]}>
                  <AlertTriangle size={15} color={colors.danger} />
                  <Text style={[styles.errorBannerText, { color: colors.danger }]}>{signInError}</Text>
                </View>
              ) : null}

              {/* Credentials Form */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Username or Email</Text>
                <View style={[styles.inputBox, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                  <User size={16} color={colors.textMuted} />
                  <TextInput
                    style={[styles.inputField, { color: colors.textPrimary }]}
                    placeholder="Username or email"
                    placeholderTextColor={colors.textMuted}
                    value={loginUsername}
                    onChangeText={setLoginUsername}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Password</Text>
                <View style={[styles.inputBox, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                  <Lock size={16} color={colors.textMuted} />
                  <TextInput
                    style={[styles.inputField, { color: colors.textPrimary }]}
                    placeholder="Enter password"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showLoginPassword}
                    value={loginPassword}
                    onChangeText={setLoginPassword}
                  />
                  <TouchableOpacity onPress={() => setShowLoginPassword(!showLoginPassword)} style={styles.eyeBtn}>
                    {showLoginPassword ? (
                      <EyeOff size={16} color={colors.textMuted} />
                    ) : (
                      <Eye size={16} color={colors.textMuted} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: colors.steelBlue }]}
                onPress={handleReturningSignIn}
                disabled={isSigningIn}
                activeOpacity={0.85}
              >
                {isSigningIn ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.primaryBtnText}>Sign In to Rakshak</Text>
                    <ArrowRight size={16} color="#FFFFFF" />
                  </>
                )}
              </TouchableOpacity>

              {/* Quick Role Tester Presets */}
              <View style={[styles.demoBox, { backgroundColor: colors.subPanel, borderColor: colors.border }]}>
                <Text style={[styles.demoTitle, { color: colors.textSecondary }]}>
                  ⚡ Instant Demo Testing Logins
                </Text>
                <View style={styles.demoButtonsRow}>
                  <TouchableOpacity
                    style={[styles.demoRoleBtn, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
                    onPress={() => handleDemoLogin('user')}
                  >
                    <Text style={styles.demoRoleEmoji}>👤</Text>
                    <Text style={[styles.demoRoleName, { color: colors.textPrimary }]}>Citizen</Text>
                    <Text style={[styles.demoRoleHint, { color: colors.textMuted }]}>user / user</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.demoRoleBtn, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
                    onPress={() => handleDemoLogin('admin')}
                  >
                    <Text style={styles.demoRoleEmoji}>🛡️</Text>
                    <Text style={[styles.demoRoleName, { color: colors.textPrimary }]}>NDRF Admin</Text>
                    <Text style={[styles.demoRoleHint, { color: colors.textMuted }]}>admin / admin</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.demoRoleBtn, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
                    onPress={() => handleDemoLogin('tester')}
                  >
                    <Text style={styles.demoRoleEmoji}>🧪</Text>
                    <Text style={[styles.demoRoleName, { color: colors.textPrimary }]}>QA Tester</Text>
                    <Text style={[styles.demoRoleHint, { color: colors.textMuted }]}>tester / tester</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={styles.switchModeLink}
                onPress={() => setMode('onboarding')}
              >
                <Text style={[styles.switchModeText, { color: colors.steelBlue }]}>
                  New user? Tap here to complete first-time setup ➔
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ========================================================================= */}
          {/* MODE: ONBOARDING WIZARD (FIRST-TIME USER FLOW) */}
          {/* ========================================================================= */}
          {mode === 'onboarding' && (
            <View style={styles.contentWrapper}>
              {/* Stepper Progress Bar */}
              <View style={styles.stepperContainer}>
                <View style={styles.stepperInfoRow}>
                  <Text style={[styles.stepCountText, { color: colors.steelBlue }]}>
                    STEP {currentStep} OF 6
                  </Text>
                  <Text style={[styles.stepNameHeader, { color: colors.textMuted }]}>
                    {currentStep === 1 && 'Language Selection'}
                    {currentStep === 2 && 'Account & Login'}
                    {currentStep === 3 && 'Profile & Birthdate'}
                    {currentStep === 4 && 'Location & Sirens'}
                    {currentStep === 5 && 'Emergency Contacts'}
                    {currentStep === 6 && 'Digital Safety Pass'}
                  </Text>
                </View>

                <View style={[styles.progressBarTrack, { backgroundColor: colors.borderSoft }]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${(currentStep / 6) * 100}%`, backgroundColor: colors.steelBlue },
                    ]}
                  />
                </View>
              </View>

              {/* =================================================================== */}
              {/* STEP 1: CHOOSE REGIONAL LANGUAGE */}
              {/* =================================================================== */}
              {currentStep === 1 && (
                <View style={styles.stepBlock}>
                  <View style={styles.stepHeader}>
                    <View style={[styles.stepIconBubble, { backgroundColor: colors.subPanel, borderColor: colors.border }]}>
                      <Globe size={20} color={colors.steelBlue} />
                    </View>
                    <View style={styles.stepHeaderCol}>
                      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
                        Choose Your Language
                      </Text>
                      <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
                        Select your preferred regional language. All alerts, voice commands, and NDRF notices will adapt immediately.
                      </Text>
                    </View>
                  </View>

                  <ScrollView style={styles.langScrollList} showsVerticalScrollIndicator={false}>
                    {SUPPORTED_LANGUAGES.map((lang) => {
                      const isSelected = selectedLang === lang.code;
                      return (
                        <TouchableOpacity
                          key={lang.code}
                          style={[
                            styles.langCard,
                            {
                              backgroundColor: isSelected ? colors.subPanel : colors.cardBg,
                              borderColor: isSelected ? colors.steelBlue : colors.borderSoft,
                            },
                          ]}
                          onPress={() => handleSelectLanguage(lang.code)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.langFlag}>{lang.flag}</Text>
                          <View style={{ flex: 1 }}>
                            <View style={styles.langNameRow}>
                              <Text style={[styles.langPrimaryName, { color: colors.textPrimary }]}>
                                {lang.name}
                              </Text>
                              <Text style={[styles.langNativeName, { color: isSelected ? colors.steelBlue : colors.textMuted }]}>
                                ({lang.nativeName})
                              </Text>
                            </View>
                            <Text style={[styles.langRegionText, { color: colors.textMuted }]}>
                              {lang.region}
                            </Text>
                          </View>
                          {isSelected && (
                            <View style={[styles.selectedCheckBadge, { backgroundColor: colors.steelBlue }]}>
                              <Check size={14} color="#FFFFFF" />
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  <View style={styles.stepNavRow}>
                    <TouchableOpacity
                      style={[styles.ghostBtn, { borderColor: colors.border }]}
                      onPress={() => {
                        handleSelectLanguage('en');
                        setCurrentStep(2);
                      }}
                    >
                      <Text style={[styles.ghostBtnText, { color: colors.textSecondary }]}>
                        Keep English
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.primaryBtn, { backgroundColor: colors.steelBlue }]}
                      onPress={() => setCurrentStep(2)}
                    >
                      <Text style={styles.primaryBtnText}>Continue</Text>
                      <ChevronRight size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* =================================================================== */}
              {/* STEP 2: ACCOUNT CREATION & LOGIN METHODS */}
              {/* =================================================================== */}
              {currentStep === 2 && (
                <View style={styles.stepBlock}>
                  <View style={styles.stepHeader}>
                    <View style={[styles.stepIconBubble, { backgroundColor: colors.subPanel, borderColor: colors.border }]}>
                      <Lock size={20} color={colors.steelBlue} />
                    </View>
                    <View style={styles.stepHeaderCol}>
                      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
                        Account & Authentication
                      </Text>
                      <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
                        Connect your account via Google One-Tap or create with email.
                      </Text>
                    </View>
                  </View>

                  {/* Real Google One-Click Button */}
                  <TouchableOpacity
                    style={[styles.googleBtn, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
                    onPress={handleGoogleBtnPress}
                    disabled={isSigningIn}
                    activeOpacity={0.85}
                  >
                    {isSigningIn ? (
                      <ActivityIndicator size="small" color={colors.steelBlue} />
                    ) : (
                      <>
                    <GoogleLogoIcon size={18} />
                    <Text style={[styles.googleBtnText, { color: colors.textPrimary }]}>
                      Continue with Google
                    </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <View style={styles.dividerRow}>
                    <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                    <Text style={[styles.dividerText, { color: colors.textMuted }]}>OR ENTER EMAIL DETAILS</Text>
                    <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Email Address</Text>
                    <View style={[styles.inputBox, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                      <Mail size={16} color={colors.textMuted} />
                      <TextInput
                        style={[styles.inputField, { color: colors.textPrimary }]}
                        placeholder="yourname@gmail.com"
                        placeholderTextColor={colors.textMuted}
                        value={accountEmail}
                        onChangeText={setAccountEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Create Password</Text>
                    <View style={[styles.inputBox, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                      <Lock size={16} color={colors.textMuted} />
                      <TextInput
                        style={[styles.inputField, { color: colors.textPrimary }]}
                        placeholder="At least 6 characters"
                        placeholderTextColor={colors.textMuted}
                        secureTextEntry={!showPassword}
                        value={accountPassword}
                        onChangeText={setAccountPassword}
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                        {showPassword ? (
                          <EyeOff size={16} color={colors.textMuted} />
                        ) : (
                          <Eye size={16} color={colors.textMuted} />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={[styles.securityTrustBadge, { backgroundColor: colors.subPanel, borderColor: colors.border }]}>
                    <ShieldCheck size={15} color={colors.success} />
                    <Text style={[styles.securityTrustText, { color: colors.textMuted }]}>
                      Protected by 256-bit encrypted emergency tokens.
                    </Text>
                  </View>

                  <View style={styles.stepNavRow}>
                    <TouchableOpacity
                      style={[styles.backBtn, { borderColor: colors.border }]}
                      onPress={() => setCurrentStep(1)}
                    >
                      <ChevronLeft size={16} color={colors.textSecondary} />
                      <Text style={[styles.backBtnText, { color: colors.textSecondary }]}>Back</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.primaryBtn, { backgroundColor: colors.steelBlue }]}
                      onPress={() => setCurrentStep(3)}
                    >
                      <Text style={styles.primaryBtnText}>Next: Profile</Text>
                      <ChevronRight size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* =================================================================== */}
              {/* STEP 3: PERSONAL PROFILE, PHOTO & BIRTHDATE */}
              {/* =================================================================== */}
              {currentStep === 3 && (
                <View style={styles.stepBlock}>
                  <View style={styles.stepHeader}>
                    <View style={[styles.stepIconBubble, { backgroundColor: colors.subPanel, borderColor: colors.border }]}>
                      <User size={20} color={colors.steelBlue} />
                    </View>
                    <View style={styles.stepHeaderCol}>
                      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
                        Profile, Photo & Birthdate
                      </Text>
                      <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
                        Enter your details and blood group for NDRF medical emergency triage.
                      </Text>
                    </View>
                  </View>

                  {/* Photo Upload Section */}
                  <View style={styles.photoCenterContainer}>
                    <TouchableOpacity
                      style={[
                        styles.avatarUploadCircle,
                        { borderColor: colors.steelBlue, backgroundColor: colors.subPanel },
                      ]}
                      onPress={handlePickPhoto}
                      activeOpacity={0.8}
                    >
                      {photoUri ? (
                        <Image source={{ uri: photoUri }} style={styles.avatarImg} />
                      ) : (
                        <View style={styles.avatarPlaceholder}>
                          <Camera size={22} color={colors.steelBlue} />
                          <Text style={[styles.avatarPlaceholderText, { color: colors.textMuted }]}>
                            Photo
                          </Text>
                        </View>
                      )}
                      <View style={[styles.cameraPill, { backgroundColor: colors.steelBlue, borderColor: colors.cardBg }]}>
                        <Camera size={11} color="#FFFFFF" />
                      </View>
                    </TouchableOpacity>
                    <Text style={[styles.photoHelperNote, { color: colors.textMuted }]}>
                      Tap avatar to choose from camera / gallery
                    </Text>

                    {/* Preset Avatars */}
                    <Text style={[styles.presetHeader, { color: colors.textSecondary }]}>
                      Or choose an avatar:
                    </Text>
                    <View style={styles.avatarPresetsRow}>
                      {PRESET_AVATARS.map((item, idx) => {
                        const isChosen = photoUri === item.url;
                        return (
                          <TouchableOpacity
                            key={idx}
                            style={[
                              styles.presetItem,
                              { borderColor: isChosen ? colors.steelBlue : colors.border },
                              isChosen && { borderWidth: 2 },
                            ]}
                            onPress={() => setPhotoUri(item.url)}
                          >
                            <Image source={{ uri: item.url }} style={styles.presetImg} />
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Full Name */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Full Name</Text>
                    <View style={[styles.inputBox, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                      <User size={16} color={colors.textMuted} />
                      <TextInput
                        style={[styles.inputField, { color: colors.textPrimary }]}
                        placeholder="Enter your full name"
                        placeholderTextColor={colors.textMuted}
                        value={fullName}
                        onChangeText={setFullName}
                      />
                    </View>
                  </View>

                  {/* Phone Number */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Mobile Phone Number</Text>
                    <View style={[styles.inputBox, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                      <View style={[styles.countryCodeBadge, { backgroundColor: colors.subPanel }]}>
                        <Text style={[styles.countryCodeText, { color: colors.textPrimary }]}>🇮🇳 +91</Text>
                      </View>
                      <TextInput
                        style={[styles.inputField, { color: colors.textPrimary }]}
                        placeholder="Enter mobile number"
                        placeholderTextColor={colors.textMuted}
                        keyboardType="phone-pad"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                      />
                    </View>
                  </View>

                  {/* Date of Birth */}
                  <View style={styles.inputGroup}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <Text style={[styles.inputLabel, { color: colors.textPrimary, marginBottom: 0 }]}>
                        Date of Birth (Birthdate)
                      </Text>
                      {birthdate ? (
                        <Text style={{ fontSize: 11, fontWeight: '700', color: colors.steelBlue }}>
                          ✓ {formatBirthdateDisplay(birthdate)}
                        </Text>
                      ) : null}
                    </View>
                    <View style={[styles.inputBox, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                      <TouchableOpacity onPress={() => setShowDatePickerModal(true)} style={{ paddingRight: 4 }}>
                        <Calendar size={18} color={colors.steelBlue} />
                      </TouchableOpacity>
                      <TextInput
                        style={[styles.inputField, { color: colors.textPrimary }]}
                        placeholder="DD / MM / YYYY (e.g. 02 / 02 / 2006)"
                        placeholderTextColor={colors.textMuted}
                        value={birthdate}
                        onChangeText={(val) => setBirthdate(formatBirthdateInputMask(val))}
                        keyboardType="numeric"
                      />
                      <TouchableOpacity
                        style={[styles.calendarPickerTriggerBtn, { backgroundColor: colors.subPanel, borderColor: colors.border }]}
                        onPress={() => setShowDatePickerModal(true)}
                        activeOpacity={0.8}
                      >
                        <Calendar size={13} color={colors.steelBlue} />
                        <Text style={[styles.calendarPickerTriggerText, { color: colors.steelBlue }]}>Pick Calendar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Blood Group Quick Picker */}
                  <View style={styles.inputGroup}>
                    <View style={styles.bloodGroupHeader}>
                      <Droplet size={14} color={colors.danger} />
                      <Text style={[styles.inputLabel, { color: colors.textPrimary, marginBottom: 0 }]}>
                        Blood Group (Medical Triage)
                      </Text>
                    </View>
                    <View style={styles.bloodChipsGrid}>
                      {BLOOD_GROUPS.map((bg) => {
                        const isSelected = bloodGroup === bg;
                        return (
                          <TouchableOpacity
                            key={bg}
                            style={[
                              styles.bloodChip,
                              {
                                backgroundColor: isSelected ? colors.danger : colors.subPanel,
                                borderColor: isSelected ? colors.danger : colors.border,
                              },
                            ]}
                            onPress={() => setBloodGroup(bg)}
                          >
                            <Text
                              style={[
                                styles.bloodChipText,
                                { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                              ]}
                            >
                              {bg}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  <View style={styles.stepNavRow}>
                    <TouchableOpacity
                      style={[styles.backBtn, { borderColor: colors.border }]}
                      onPress={() => setCurrentStep(2)}
                    >
                      <ChevronLeft size={16} color={colors.textSecondary} />
                      <Text style={[styles.backBtnText, { color: colors.textSecondary }]}>Back</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.primaryBtn, { backgroundColor: colors.steelBlue }]}
                      onPress={() => setCurrentStep(4)}
                    >
                      <Text style={styles.primaryBtnText}>Next: Location</Text>
                      <ChevronRight size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* =================================================================== */}
              {/* STEP 4: PRECISE GPS LOCATION & CRITICAL SIREN ALERTS */}
              {/* =================================================================== */}
              {currentStep === 4 && (
                <View style={styles.stepBlock}>
                  <View style={styles.stepHeader}>
                    <View style={[styles.stepIconBubble, { backgroundColor: colors.subPanel, borderColor: colors.border }]}>
                      <Navigation size={20} color={colors.steelBlue} />
                    </View>
                    <View style={styles.stepHeaderCol}>
                      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
                        Precise Location & Disruption Alerts
                      </Text>
                      <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
                        Precise GPS is required for real-time corridor monitoring and AI route re-planning.
                      </Text>
                    </View>
                  </View>

                  {/* Permission Priming Card */}
                  <View
                    style={[
                      styles.permissionPrimingCard,
                      {
                        backgroundColor: colors.subPanel,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.primingHeader}>
                      <MapPin size={18} color={colors.steelBlue} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.primingTitle, { color: colors.textPrimary }]}>
                          Enable High-Precision Slope Geofencing
                        </Text>
                        <Text style={[styles.primingBody, { color: colors.textSecondary }]}>
                          Uses satellite GPS to detect if you are within 500m of active rockfalls on NH-10 or NH-29.
                        </Text>
                      </View>
                    </View>

                    {userLocation ? (
                      <View style={[styles.detectedLocationBox, { backgroundColor: colors.cardBg, borderColor: colors.steelBlue }]}>
                        <View style={styles.detectedBadgeRow}>
                          <View style={[styles.liveGpsBadge, { backgroundColor: colors.success }]}>
                            <View style={styles.livePulseDot} />
                            <Text style={styles.liveGpsText}>
                              {userLocation.isLiveGps ? 'PRECISE GPS ACTIVE' : 'APPROXIMATE REGION'}
                            </Text>
                          </View>
                          <Text style={[styles.accuracyText, { color: colors.textMuted }]}>
                            ±{userLocation.accuracy || 15}m
                          </Text>
                        </View>

                        <Text style={[styles.locationNameBig, { color: colors.textPrimary }]} numberOfLines={1}>
                          📍 {userLocation.locationName}
                        </Text>
                        <Text style={[styles.coordsSub, { color: colors.steelBlue }]}>
                          {userLocation.latitude.toFixed(4)}°N, {userLocation.longitude.toFixed(4)}°E
                        </Text>

                        <TouchableOpacity
                          style={styles.reDetectBtn}
                          onPress={handleRequestPreciseLocation}
                        >
                          <RefreshCw size={12} color={colors.steelBlue} />
                          <Text style={[styles.reDetectText, { color: colors.steelBlue }]}>Re-detect GPS</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[styles.primaryBtn, { backgroundColor: colors.steelBlue }]}
                        onPress={handleRequestPreciseLocation}
                        disabled={isLocating}
                        activeOpacity={0.85}
                      >
                        {isLocating ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <>
                            <Navigation size={15} color="#FFFFFF" />
                            <Text style={styles.primaryBtnText}>Allow Precise Location</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}

                    {locationError ? (
                      <Text style={[styles.locationErrorText, { color: colors.danger }]}>⚠️ {locationError}</Text>
                    ) : null}
                  </View>

                  {/* Fallback Sector Selector */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
                      Monitored Corridor (Fallback)
                    </Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.corridorScroll}
                    >
                      {MOUNTAIN_SECTORS.map((sector) => {
                        const isChosen = selectedSectorFallback === sector;
                        return (
                          <TouchableOpacity
                            key={sector}
                            style={[
                              styles.corridorChip,
                              {
                                backgroundColor: isChosen ? colors.subPanel : colors.cardBg,
                                borderColor: isChosen ? colors.steelBlue : colors.border,
                              },
                            ]}
                            onPress={() => setSelectedSectorFallback(sector)}
                          >
                            <Text
                              style={[
                                styles.corridorChipText,
                                { color: isChosen ? colors.steelBlue : colors.textPrimary },
                              ]}
                            >
                              {sector}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>

                  {/* Critical Notification Priming */}
                  <View
                    style={[
                      styles.notifCard,
                      {
                        backgroundColor: colors.subPanel,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.notifLeft}>
                      <View style={[styles.notifIconWrap, { backgroundColor: notificationEnabled ? colors.success : colors.warning }]}>
                        <Volume2 size={16} color="#FFFFFF" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.notifTitle, { color: colors.textPrimary }]}>
                          Corridor Disruption Alerts
                        </Text>
                        <Text style={[styles.notifDesc, { color: colors.textMuted }]}>
                          Receive instant push notifications for highway closures & detour advisories.
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.notifToggleBtn,
                        { backgroundColor: notificationEnabled ? colors.success : colors.steelBlue },
                      ]}
                      onPress={handleToggleNotifications}
                    >
                      <Text style={styles.notifToggleText}>
                        {notificationEnabled ? '✓ Active' : 'Enable'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.stepNavRow}>
                    <TouchableOpacity
                      style={[styles.backBtn, { borderColor: colors.border }]}
                      onPress={() => setCurrentStep(3)}
                    >
                      <ChevronLeft size={16} color={colors.textSecondary} />
                      <Text style={[styles.backBtnText, { color: colors.textSecondary }]}>Back</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.primaryBtn, { backgroundColor: colors.steelBlue }]}
                      onPress={() => setCurrentStep(5)}
                    >
                      <Text style={styles.primaryBtnText}>Next: Emergency</Text>
                      <ChevronRight size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* =================================================================== */}
              {/* STEP 5: EMERGENCY CONTACTS SETUP */}
              {/* =================================================================== */}
              {currentStep === 5 && (
                <View style={styles.stepBlock}>
                  <View style={styles.stepHeader}>
                    <View style={[styles.stepIconBubble, { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder }]}>
                      <Heart size={20} color={colors.danger} />
                    </View>
                    <View style={styles.stepHeaderCol}>
                      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
                        Emergency Safety Contacts
                      </Text>
                      <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
                        In danger, 1-tap SOS immediately broadcasts your live GPS coordinates to this contact via SMS.
                      </Text>
                    </View>
                  </View>

                  {/* Relationship selector */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
                      Relationship to You
                    </Text>
                    <View style={styles.relationChipsRow}>
                      {RELATIONSHIPS.map((rel) => {
                        const isSelected = emergencyRelation === rel;
                        return (
                          <TouchableOpacity
                            key={rel}
                            style={[
                              styles.relationChip,
                              {
                                backgroundColor: isSelected ? colors.dangerBg : colors.subPanel,
                                borderColor: isSelected ? colors.danger : colors.border,
                              },
                            ]}
                            onPress={() => setEmergencyRelation(rel)}
                          >
                            <Text
                              style={[
                                styles.relationChipText,
                                { color: isSelected ? colors.danger : colors.textPrimary },
                              ]}
                            >
                              {rel}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Emergency Contact Name */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
                      Emergency Contact Name
                    </Text>
                    <View style={[styles.inputBox, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                      <User size={16} color={colors.textMuted} />
                      <TextInput
                        style={[styles.inputField, { color: colors.textPrimary }]}
                        placeholder="Enter emergency contact name"
                        placeholderTextColor={colors.textMuted}
                        value={emergencyName}
                        onChangeText={setEmergencyName}
                      />
                    </View>
                  </View>

                  {/* Emergency Contact Phone */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
                      Emergency Contact Phone Number
                    </Text>
                    <View style={[styles.inputBox, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                      <View style={[styles.countryCodeBadge, { backgroundColor: colors.subPanel }]}>
                        <Text style={[styles.countryCodeText, { color: colors.textPrimary }]}>🇮🇳 +91</Text>
                      </View>
                      <TextInput
                        style={[styles.inputField, { color: colors.textPrimary }]}
                        placeholder="Enter mobile number"
                        placeholderTextColor={colors.textMuted}
                        keyboardType="phone-pad"
                        value={emergencyPhone}
                        onChangeText={setEmergencyPhone}
                      />
                    </View>
                  </View>

                  {/* Live SMS Preview */}
                  <View
                    style={[
                      styles.smsPreviewBox,
                      {
                        backgroundColor: colors.subPanel,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.smsPreviewHeader}>
                      <Smartphone size={14} color={colors.steelBlue} />
                      <Text style={[styles.smsPreviewLabel, { color: colors.steelBlue }]}>
                        AUTOMATIC SOS SMS BROADCAST PREVIEW
                      </Text>
                    </View>
                    <Text style={[styles.smsPreviewText, { color: colors.textSecondary }]}>
                      "🚨 EMERGENCY LANDSLIDE ALERT! I have triggered an SOS on RAKSHAK NER. Live GPS:{' '}
                      {userLocation
                        ? `${userLocation.latitude.toFixed(4)}°N, ${userLocation.longitude.toFixed(4)}°E (${userLocation.locationName})`
                        : '[Live GPS coordinates and nearest monitored sector will be attached automatically]'}"
                    </Text>
                  </View>

                  <View style={styles.stepNavRow}>
                    <TouchableOpacity
                      style={[styles.backBtn, { borderColor: colors.border }]}
                      onPress={() => setCurrentStep(4)}
                    >
                      <ChevronLeft size={16} color={colors.textSecondary} />
                      <Text style={[styles.backBtnText, { color: colors.textSecondary }]}>Back</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.primaryBtn, { backgroundColor: colors.steelBlue }]}
                      onPress={() => setCurrentStep(6)}
                    >
                      <Text style={styles.primaryBtnText}>Review Pass</Text>
                      <ChevronRight size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* =================================================================== */}
              {/* STEP 6: DIGITAL CITIZEN SAFETY PASS & LAUNCH */}
              {/* =================================================================== */}
              {currentStep === 6 && (
                <View style={styles.stepBlock}>
                  <View style={styles.stepHeader}>
                    <View style={[styles.stepIconBubble, { backgroundColor: colors.successBg, borderColor: colors.successBorder }]}>
                      <Award size={20} color={colors.success} />
                    </View>
                    <View style={styles.stepHeaderCol}>
                      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
                        Digital Citizen Safety Pass
                      </Text>
                      <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
                        Setup complete! Review your citizen pass and access the app.
                      </Text>
                    </View>
                  </View>

                  {/* Digital Pass Card */}
                  <View
                    style={[
                      styles.safetyPassCard,
                      {
                        backgroundColor: colors.subPanel,
                        borderColor: colors.steelBlue,
                      },
                    ]}
                  >
                    {/* Pass Top Ribbon */}
                    <View style={[styles.passTopRibbon, { borderBottomColor: colors.border }]}>
                      <View style={styles.passLogoRow}>
                        <ShieldAlert size={16} color={colors.steelBlue} />
                        <Text style={[styles.passGovTitle, { color: colors.steelBlue }]}>RAKSHAK NER DISASTER RESCUE GUARD</Text>
                      </View>
                      <View style={[styles.passActivePill, { backgroundColor: colors.success }]}>
                        <Text style={styles.passActivePillText}>VERIFIED</Text>
                      </View>
                    </View>

                    {/* Pass Body */}
                    <View style={styles.passBodyRow}>
                      {photoUri ? (
                        <Image source={{ uri: photoUri }} style={[styles.passAvatar, { borderColor: colors.steelBlue }]} />
                      ) : (
                        <View style={[styles.passAvatar, { borderColor: colors.steelBlue, backgroundColor: colors.cardBg, justifyContent: 'center', alignItems: 'center' }]}>
                          <User size={28} color={colors.steelBlue} />
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.passName, { color: colors.textPrimary }]}>
                          {fullName.trim() || 'Citizen Responder'}
                        </Text>
                        <Text style={[styles.passRole, { color: colors.steelBlue }]}>
                          Role: Citizen Responder
                        </Text>
                        <Text style={[styles.passSubDetail, { color: colors.textMuted }]}>
<<<<<<< HEAD
                          DOB: {birthdate.trim() || 'Not Specified'} • Blood: {bloodGroup || 'Not Specified'}
=======
                          DOB: {formatBirthdateDisplay(birthdate)} • Blood: {bloodGroup}
>>>>>>> 2911609 (fix(birthdate): add interactive calendar date picker modal and date display formatting)
                        </Text>
                      </View>
                    </View>

                    {/* Pass Details Grid */}
                    <View
                      style={[
                        styles.passDetailsGrid,
                        {
                          backgroundColor: colors.cardBg,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <View style={styles.passDetailItem}>
                        <Text style={[styles.passDetailLabel, { color: colors.textMuted }]}>
                          LANGUAGE
                        </Text>
                        <Text style={[styles.passDetailValue, { color: colors.textPrimary }]}>
                          {SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang)?.name || 'English'}
                        </Text>
                      </View>

                      <View style={styles.passDetailItem}>
                        <Text style={[styles.passDetailLabel, { color: colors.textMuted }]}>
                          MONITORED ZONE
                        </Text>
                        <Text
                          style={[styles.passDetailValue, { color: colors.textPrimary }]}
                          numberOfLines={1}
                        >
                          {userLocation ? userLocation.locationName : selectedSectorFallback}
                        </Text>
                      </View>

                      <View style={styles.passDetailItem}>
                        <Text style={[styles.passDetailLabel, { color: colors.textMuted }]}>
                          EMERGENCY SOS
                        </Text>
                        <Text style={[styles.passDetailValue, { color: colors.textPrimary }]}>
                          {emergencyName.trim()
                            ? `${emergencyName} ${emergencyRelation ? `(${emergencyRelation})` : ''}`
                            : emergencyPhone.trim()
                            ? emergencyPhone
                            : 'Not configured'}
                        </Text>
                      </View>
                    </View>

                    {/* Security Watermark */}
                    <View style={styles.passWatermarkRow}>
                      <ShieldCheck size={13} color={colors.success} />
                      <Text style={[styles.passWatermarkText, { color: colors.textMuted }]}>
                        Synced with NDRF Command Network • Field Ready
                      </Text>
                    </View>
                  </View>

                  {/* Launch App Button */}
                  <TouchableOpacity
                    style={[styles.primaryBtn, { backgroundColor: colors.success, marginBottom: 10 }]}
                    onPress={handleCompleteOnboarding}
                    disabled={isAuthLoading}
                    activeOpacity={0.85}
                  >
                    {isAuthLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Text style={styles.primaryBtnText}>Launch Portal & Access App</Text>
                        <Sparkles size={16} color="#FFFFFF" />
                      </>
                    )}
                  </TouchableOpacity>

                  <View style={styles.stepNavRow}>
                    <TouchableOpacity
                      style={[styles.backBtn, { borderColor: colors.border }]}
                      onPress={() => setCurrentStep(5)}
                    >
                      <ChevronLeft size={16} color={colors.textSecondary} />
                      <Text style={[styles.backBtnText, { color: colors.textSecondary }]}>
                        Edit Details
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
<<<<<<< HEAD
=======

      {/* Google Account Quick Auth Modal */}
      <Modal visible={showGoogleAuthModal} transparent animationType="slide" onRequestClose={() => setShowGoogleAuthModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <GoogleLogoIcon size={22} />
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Google Sign-In</Text>
              </View>
              <TouchableOpacity onPress={() => setShowGoogleAuthModal(false)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
              Authorize your Google Account to log in to LOGIX-NER Smart Logistics Grid:
            </Text>

            <View style={[styles.inputGroup, { marginTop: 10 }]}>
              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Google Email Address</Text>
              <View style={[styles.inputBox, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                <Mail size={16} color={colors.steelBlue} />
                <TextInput
                  style={[styles.inputField, { color: colors.textPrimary }]}
                  value={googleAuthEmail}
                  onChangeText={setGoogleAuthEmail}
                  placeholder="name@gmail.com"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Full Name</Text>
              <View style={[styles.inputBox, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                <User size={16} color={colors.steelBlue} />
                <TextInput
                  style={[styles.inputField, { color: colors.textPrimary }]}
                  value={googleAuthName}
                  onChangeText={setGoogleAuthName}
                  placeholder="Your Name"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.steelBlue, marginTop: 14 }]}
              onPress={handleConfirmGoogleAuthModal}
              activeOpacity={0.85}
            >
              <GoogleLogoIcon size={16} />
              <Text style={styles.primaryBtnText}>Sign In as {googleAuthEmail.split('@')[0] || 'User'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ alignItems: 'center', marginTop: 12, paddingVertical: 6 }}
              onPress={() => setShowGoogleAuthModal(false)}
            >
              <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: '700' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Date of Birth Interactive Calendar Picker Modal */}
      <Modal visible={showDatePickerModal} transparent animationType="slide" onRequestClose={() => setShowDatePickerModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.cardBg, borderColor: colors.border, maxWidth: 440 }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Calendar size={20} color={colors.steelBlue} />
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Select Date of Birth</Text>
              </View>
              <TouchableOpacity onPress={() => setShowDatePickerModal(false)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Selected Formatted Date Banner */}
            <View style={[styles.datePreviewBadge, { backgroundColor: colors.subPanel, borderColor: colors.steelBlue }]}>
              <Text style={[styles.datePreviewText, { color: colors.steelBlue }]}>
                🗓️ Selected DOB: {formatBirthdateDisplay(`${pickerDay < 10 ? '0' + pickerDay : pickerDay}/${pickerMonth < 10 ? '0' + pickerMonth : pickerMonth}/${pickerYear}`)}
              </Text>
            </View>

            <ScrollView style={{ maxHeight: 340, width: '100%' }} showsVerticalScrollIndicator={false}>
              {/* Quick Age Presets */}
              <Text style={[styles.datePickerSectionTitle, { color: colors.textPrimary }]}>Quick Age Presets</Text>
              <View style={styles.datePresetChipsRow}>
                {[
                  { label: '🎂 18 yrs (2008)', day: 1, month: 1, year: 2008 },
                  { label: '🎂 20 yrs (2006)', day: 2, month: 2, year: 2006 },
                  { label: '🎂 25 yrs (2001)', day: 15, month: 8, year: 2001 },
                  { label: '🎂 30 yrs (1996)', day: 10, month: 5, year: 1996 },
                  { label: '🎂 35 yrs (1991)', day: 20, month: 11, year: 1991 },
                ].map((preset) => (
                  <TouchableOpacity
                    key={preset.label}
                    style={[styles.datePresetChip, { backgroundColor: colors.subPanel, borderColor: colors.border }]}
                    onPress={() => {
                      setPickerDay(preset.day);
                      setPickerMonth(preset.month);
                      setPickerYear(preset.year);
                    }}
                  >
                    <Text style={[styles.datePresetChipText, { color: colors.textPrimary }]}>{preset.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Year Selector */}
              <Text style={[styles.datePickerSectionTitle, { color: colors.textPrimary, marginTop: 14 }]}>Birth Year</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {Array.from({ length: 85 }, (_, i) => 2026 - i).map((y) => {
                  const isSel = pickerYear === y;
                  return (
                    <TouchableOpacity
                      key={y}
                      style={[
                        styles.yearChip,
                        {
                          backgroundColor: isSel ? colors.steelBlue : colors.subPanel,
                          borderColor: isSel ? colors.steelBlue : colors.border,
                        },
                      ]}
                      onPress={() => setPickerYear(y)}
                    >
                      <Text style={[styles.yearChipText, { color: isSel ? '#FFFFFF' : colors.textPrimary }]}>{y}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Month Selector */}
              <Text style={[styles.datePickerSectionTitle, { color: colors.textPrimary }]}>Month</Text>
              <View style={styles.monthGrid}>
                {[
                  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                ].map((m, idx) => {
                  const mNum = idx + 1;
                  const isSel = pickerMonth === mNum;
                  return (
                    <TouchableOpacity
                      key={m}
                      style={[
                        styles.monthChip,
                        {
                          backgroundColor: isSel ? colors.steelBlue : colors.subPanel,
                          borderColor: isSel ? colors.steelBlue : colors.border,
                        },
                      ]}
                      onPress={() => setPickerMonth(mNum)}
                    >
                      <Text style={[styles.monthChipText, { color: isSel ? '#FFFFFF' : colors.textPrimary }]}>{m}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Day Selector */}
              <Text style={[styles.datePickerSectionTitle, { color: colors.textPrimary, marginTop: 14 }]}>Day</Text>
              <View style={styles.dayGrid}>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
                  const isSel = pickerDay === d;
                  return (
                    <TouchableOpacity
                      key={d}
                      style={[
                        styles.dayChip,
                        {
                          backgroundColor: isSel ? colors.steelBlue : colors.subPanel,
                          borderColor: isSel ? colors.steelBlue : colors.border,
                        },
                      ]}
                      onPress={() => setPickerDay(d)}
                    >
                      <Text style={[styles.dayChipText, { color: isSel ? '#FFFFFF' : colors.textPrimary }]}>{d}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.steelBlue, marginTop: 14 }]}
              onPress={() => {
                const dStr = pickerDay < 10 ? `0${pickerDay}` : `${pickerDay}`;
                const mStr = pickerMonth < 10 ? `0${pickerMonth}` : `${pickerMonth}`;
                setBirthdate(`${dStr} / ${mStr} / ${pickerYear}`);
                setShowDatePickerModal(false);
              }}
              activeOpacity={0.85}
            >
              <Check size={16} color="#FFFFFF" />
              <Text style={styles.primaryBtnText}>Confirm Birthdate ({formatBirthdateDisplay(`${pickerDay < 10 ? '0' + pickerDay : pickerDay}/${pickerMonth < 10 ? '0' + pickerMonth : pickerMonth}/${pickerYear}`)})</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
>>>>>>> 2911609 (fix(birthdate): add interactive calendar date picker modal and date display formatting)
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'ios' ? 12 : 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  brandTitleCol: {
    flex: 1,
    minWidth: 0,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appTitle: {
    fontSize: 13.5,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  activePill: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 5,
  },
  activePillText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },
  appSubtitle: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: 1,
  },
  modeContainer: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 6,
    alignItems: 'center',
  },
  modeSegment: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 420,
    borderRadius: 10,
    borderWidth: 1,
    padding: 3,
    gap: 4,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modeTabActive: {
    elevation: 2,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 40,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  contentWrapper: {
    width: '100%',
  },
  stepperContainer: {
    marginBottom: 14,
  },
  stepperInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepCountText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  stepNameHeader: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  stepBlock: {
    width: '100%',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 14,
  },
  stepIconBubble: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepHeaderCol: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  stepSubtitle: {
    fontSize: 11.5,
    lineHeight: 16,
  },
  langScrollList: {
    maxHeight: 280,
    marginBottom: 14,
  },
  langCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 6,
    gap: 10,
  },
  langFlag: {
    fontSize: 20,
  },
  langNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  langPrimaryName: {
    fontSize: 13,
    fontWeight: '800',
  },
  langNativeName: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  langRegionText: {
    fontSize: 10,
    marginTop: 1,
  },
  selectedCheckBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 8,
  },
  ghostBtn: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  ghostBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    paddingVertical: 9,
    borderRadius: 8,
    gap: 8,
    marginBottom: 10,
  },
  googleIconBox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EA4335',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleG: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  googleBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  inputGroup: {
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    marginBottom: 4,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    gap: 8,
  },
  inputField: {
    flex: 1,
    height: '100%',
    fontSize: 12.5,
  },
  eyeBtn: {
    padding: 4,
  },
  countryCodeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
  },
  countryCodeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  securityTrustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  securityTrustText: {
    fontSize: 10,
    fontWeight: '600',
  },
  photoCenterContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarUploadCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
  },
  cameraPill: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  photoHelperNote: {
    fontSize: 10,
    marginTop: 4,
  },
  presetHeader: {
    fontSize: 10.5,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 6,
  },
  avatarPresetsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  presetItem: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
  },
  presetImg: {
    width: '100%',
    height: '100%',
  },
  bloodGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  bloodChipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  bloodChip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
  },
  bloodChipText: {
    fontSize: 11,
    fontWeight: '800',
  },
  permissionPrimingCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  primingHeader: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  primingTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    marginBottom: 2,
  },
  primingBody: {
    fontSize: 11,
    lineHeight: 15,
  },
  detectedLocationBox: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  detectedBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  liveGpsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  livePulseDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFFFFF',
  },
  liveGpsText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  accuracyText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  locationNameBig: {
    fontSize: 12.5,
    fontWeight: '800',
    marginBottom: 2,
  },
  coordsSub: {
    fontSize: 10,
    fontWeight: '700',
  },
  reDetectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  reDetectText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  locationErrorText: {
    fontSize: 10.5,
    marginTop: 6,
  },
  corridorScroll: {
    flexDirection: 'row',
    marginTop: 4,
  },
  corridorChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 6,
  },
  corridorChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
    gap: 8,
  },
  notifLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notifIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    marginBottom: 1,
  },
  notifDesc: {
    fontSize: 9.5,
    lineHeight: 13,
  },
  notifToggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  notifToggleText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
  },
  relationChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  relationChip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
  },
  relationChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  smsPreviewBox: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  smsPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  smsPreviewLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  smsPreviewText: {
    fontSize: 10.5,
    fontStyle: 'italic',
    lineHeight: 14,
  },
  safetyPassCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 14,
  },
  passTopRibbon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingBottom: 6,
    marginBottom: 10,
  },
  passLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  passGovTitle: {
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  passActivePill: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  passActivePillText: {
    color: '#FFFFFF',
    fontSize: 7.5,
    fontWeight: '900',
  },
  passBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  passAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
  },
  passName: {
    fontSize: 14.5,
    fontWeight: '900',
  },
  passRole: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 1,
  },
  passSubDetail: {
    fontSize: 9.5,
    marginTop: 1,
  },
  passDetailsGrid: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 8,
    gap: 6,
    marginBottom: 8,
  },
  passDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  passDetailLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  passDetailValue: {
    fontSize: 11,
    fontWeight: '800',
    maxWidth: '65%',
  },
  passWatermarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  passWatermarkText: {
    fontSize: 9,
    fontWeight: '600',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  errorBannerText: {
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },
  demoBox: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 14,
    marginBottom: 10,
  },
  demoTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  demoButtonsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  demoRoleBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  demoRoleEmoji: {
    fontSize: 15,
    marginBottom: 1,
  },
  demoRoleName: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  demoRoleHint: {
    fontSize: 8.5,
    marginTop: 1,
  },
  switchModeLink: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchModeText: {
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
    maxWidth: 400,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
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
    lineHeight: 16,
    marginBottom: 6,
  },
  calendarPickerTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    marginLeft: 6,
  },
  calendarPickerTriggerText: {
    fontSize: 11,
    fontWeight: '700',
  },
  datePreviewBadge: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    alignItems: 'center',
  },
  datePreviewText: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  datePickerSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  datePresetChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  datePresetChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  datePresetChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  yearChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 6,
  },
  yearChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  monthChip: {
    width: '23%',
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  monthChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  dayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  dayChip: {
    width: '12.5%',
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  dayChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
});

