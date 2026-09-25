/**
 * Seven Sister States Regional Language Translation Service
 * Supports 11 North Eastern & Regional Languages:
 * English, Hindi, Assamese, Bengali, Khasi, Garo, Manipuri, Mizo, Nagamese, Kokborok, Nepali
 */

export type LanguageCode =
  | 'en' // English
  | 'hi' // Hindi (हिन्दी)
  | 'as' // Assamese (অসমীয়া)
  | 'bn' // Bengali (বাংলা)
  | 'kha' // Khasi (Ka Ktien Khasi)
  | 'gar' // Garo (A·chik)
  | 'mni' // Manipuri / Meitei (ꯃꯩꯇꯩꯂꯣꯟ)
  | 'mzo' // Mizo (Mizo ṭawng)
  | 'nag' // Nagamese (Nagaland)
  | 'kok' // Kokborok (Tripura)
  | 'ne'; // Nepali (नेपाली)

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  region: string;
  flag: string;
  locale: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', region: 'Global / Standard', flag: '🇬🇧', locale: 'en-US' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', region: 'Common Regional', flag: '🇮🇳', locale: 'hi-IN' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', region: 'Assam', flag: '🌾', locale: 'as-IN' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', region: 'Tripura / Assam', flag: '🇧🇩', locale: 'bn-IN' },
  { code: 'kha', name: 'Khasi', nativeName: 'Ka Ktien Khasi', region: 'Meghalaya', flag: '⛰️', locale: 'en-IN' },
  { code: 'gar', name: 'Garo', nativeName: 'A·chik', region: 'Meghalaya', flag: '🌿', locale: 'en-IN' },
  { code: 'mni', name: 'Manipuri', nativeName: 'ꯃꯩꯇꯩꯂꯣꯟ', region: 'Manipur', flag: '🏹', locale: 'en-IN' },
  { code: 'mzo', name: 'Mizo', nativeName: 'Mizo ṭawng', region: 'Mizoram', flag: '🏞️', locale: 'en-IN' },
  { code: 'nag', name: 'Nagamese', nativeName: 'Nagamese', region: 'Nagaland', flag: '🏔️', locale: 'en-IN' },
  { code: 'kok', name: 'Kokborok', nativeName: 'Kokborok', region: 'Tripura', flag: '🗣️', locale: 'en-IN' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', region: 'Sikkim', flag: '🏔️', locale: 'ne-NP' },
];

export interface TranslationDictionary {
  appTitle: string;
  appSubtitle: string;
  dashboard: string;
  alerts: string;
  report: string;
  sensors: string;
  settings: string;
  sosEmergency: string;
  signIn: string;
  signOut: string;
  emergencyContacts: string;
  voiceMicTooltip: string;
  listeningVoice: string;
  redAlert: string;
  evacuateNow: string;
  readOfficialBulletin: string;
  broadcastSMS: string;
  helplines: string;
  shelters: string;
}

const TRANSLATIONS: Record<LanguageCode, TranslationDictionary> = {
  en: {
    appTitle: 'LOGIX-NER',
    appSubtitle: 'AI Smart Logistics & Accessibility Grid',
    dashboard: 'Dashboard',
    alerts: 'Alerts',
    report: 'Report',
    sensors: 'Sensors',
    settings: 'Settings',
    sosEmergency: 'SOS EMERGENCY',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    emergencyContacts: 'Emergency Contacts (Friends & Family)',
    voiceMicTooltip: 'LOGIX AI Voice Assistant',
    listeningVoice: 'Listening for regional voice commands...',
    redAlert: 'RED ALERT - LEVEL 4',
    evacuateNow: 'EVACUATE IMMEDIATELY',
    readOfficialBulletin: 'Read Official Bulletin',
    broadcastSMS: 'Broadcast via SMS 📱',
    helplines: 'Emergency Hotlines',
    shelters: 'Relief Camps & Shelters',
  },
  hi: {
    appTitle: 'LOGIX-NER (लॉजिक्स उत्तर-पूर्व)',
    appSubtitle: 'एआई लॉजिस्टिक्स एवं मार्ग सुगमयता ग्रिड',
    dashboard: 'डैशबोर्ड',
    alerts: 'चेतावनी',
    report: 'रिपोर्ट दर्ज करें',
    sensors: 'सेंसर डेटा',
    settings: 'सेटिंग्स',
    sosEmergency: 'आपातकालीन एसओएस',
    signIn: 'साइन इन करें',
    signOut: 'साइन आउट',
    emergencyContacts: 'आपातकालीन संपर्क (परिवार और मित्र)',
    voiceMicTooltip: 'वॉयस एआई कमांड सहायक',
    listeningVoice: 'क्षेत्रीय आवाज कमांड सुन रहा है...',
    redAlert: 'रेड अलर्ट - स्तर 4',
    evacuateNow: 'तुरंत सुरक्षित स्थान पर जाएं',
    readOfficialBulletin: 'आधिकारिक बुलेटिन पढ़ें',
    broadcastSMS: 'एसएमएस से भेजें 📱',
    helplines: 'आपातकालीन हेल्पलाइन',
    shelters: 'राहत शिविर',
  },
  as: {
    appTitle: 'LOGIX-NER (লজিংক্স উত্তৰ-পূৰ্বাঞ্চল)',
    appSubtitle: 'এআই স্মাৰ্ট লজিষ্টিকছ আৰু পথ সুগমতা গ্ৰিড',
    dashboard: 'ডেশ্ববৰ্ড',
    alerts: 'সতৰ্কবাৰ্তা',
    report: 'ৰিপৰ্ট',
    sensors: 'চেনচৰ',
    settings: 'চেটিংছ',
    sosEmergency: 'জৰুৰীকালীন এছ.অ.এছ',
    signIn: 'চাইন ইন',
    signOut: 'চাইন আউট',
    emergencyContacts: 'জৰুৰীকালীন যোগাযোগ (পৰিয়াল আৰু বন্ধু)',
    voiceMicTooltip: 'ভয়েচ এআই সহায়ক',
    listeningVoice: 'আঞ্চলিক কণ্ঠ নিৰ্দেশনা শুনি আছে...',
    redAlert: 'ৰেড এলাৰ্ট - স্তৰ ৪',
    evacuateNow: 'তাত্ক্ষণিক স্থানান্তৰ',
    readOfficialBulletin: 'চৰকাৰী জাননী পঢ়ক',
    broadcastSMS: 'এছ.এম.এছ প্ৰেৰণ 📱',
    helplines: 'জৰুৰীকালীন হেল্পলাইন',
    shelters: 'আশ্ৰয় শিবিৰ',
  },
  bn: {
    appTitle: 'LOGIX-NER (লজিক্স উত্তর-পূর্ব)',
    appSubtitle: 'এআই লজিস্টিকস ও অ্যাক্সেসিবিলিটি গ্রিড',
    dashboard: 'ড্যাশবোর্ড',
    alerts: 'সতর্কবার্তা',
    report: 'রিপোর্ট',
    sensors: 'সেন্সর',
    settings: 'সেটিংস',
    sosEmergency: 'জরুরি এসওএস',
    signIn: 'সাইন ইন',
    signOut: 'সাইন আউট',
    emergencyContacts: 'জরুরি যোগাযোগ (পরিবার ও বন্ধু)',
    voiceMicTooltip: 'ভয়েস এআই সহায়ক',
    listeningVoice: 'আঞ্চলিক ভয়েস কমান্ড শুনছে...',
    redAlert: 'রেড অ্যালার্ট - লেভেল ৪',
    evacuateNow: 'অবিলম্বে নিরাপদ স্থানে যান',
    readOfficialBulletin: 'সরকারী বুলেটিন পড়ুন',
    broadcastSMS: 'এসএমএস পাঠান 📱',
    helplines: 'জরুরি হেল্পলাইন',
    shelters: 'ত্রাণ শিবির',
  },
  kha: {
    appTitle: 'LOGIX-NER',
    appSubtitle: 'AI Logistics & Route Accessibility Grid',
    dashboard: 'Dashboard',
    alerts: 'Jingma',
    report: 'Report',
    sensors: 'Sensors',
    settings: 'Settings',
    sosEmergency: 'SOS JINGEH',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    emergencyContacts: 'Lok & Kur (Emergency Contacts)',
    voiceMicTooltip: 'LOGIX AI Voice Assistant',
    listeningVoice: 'Ap ya ki bthah ktien...',
    redAlert: 'RED ALERT - LEVEL 4',
    evacuateNow: 'Phet Shaki Shngiam Wut Wut',
    readOfficialBulletin: 'Pule Jingkyntu Sorkar',
    broadcastSMS: 'Phah SMS 📱',
    helplines: 'Helplines Jingeh',
    shelters: 'Shnong Jingshngiam',
  },
  gar: {
    appTitle: 'LOGIX-NER',
    appSubtitle: 'AI Smart Logistics Grid',
    dashboard: 'Dashboard',
    alerts: 'Mikrakani',
    report: 'Report',
    sensors: 'Sensors',
    settings: 'Settings',
    sosEmergency: 'SOS KENANI',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    emergencyContacts: 'Ma·drang & Ripel (Emergency)',
    voiceMicTooltip: 'LOGIX AI Voice Assistant',
    listeningVoice: 'Ku·rang niksamsoenga...',
    redAlert: 'RED ALERT - LEVEL 4',
    evacuateNow: 'Re·angbo Shngiamchi Wut Wut',
    readOfficialBulletin: 'Poraibo Nokgipa Sea',
    broadcastSMS: 'Watbo SMS 📱',
    helplines: 'Helplines Dakchakan',
    shelters: 'Relief Camps',
  },
  mni: {
    appTitle: 'LOGIX-NER',
    appSubtitle: 'AI Logistics & Accessibility Grid',
    dashboard: 'ꯗꯦꯁꯕꯣꯔꯗ',
    alerts: 'ꯆꯦꯛꯁꯤꯟꯋꯥ',
    report: 'ꯔꯤꯄꯣꯔꯠ',
    sensors: 'ꯁꯦꯟꯁꯔ',
    settings: 'ꯁꯦꯇꯤꯡꯁ',
    sosEmergency: 'ꯑꯀꯅꯕ ꯑꯦꯁ.ꯑꯣ.ꯑꯦꯁ',
    signIn: 'ꯁꯥꯏꯟ ꯏꯟ',
    signOut: 'ꯁꯥꯏꯟ ꯑꯥꯎꯠ',
    emergencyContacts: 'ꯏꯃꯨꯡ-ꯃꯅꯨꯡ ꯑꯃꯁꯨꯡ ꯃꯔꯨꯞ (Emergency)',
    voiceMicTooltip: 'LOGIX AI Voice Assistant',
    listeningVoice: 'ꯈꯣꯟꯊꯣꯛ ꯇꯥꯕ꯭ꯔꯤ...',
    redAlert: 'ꯔꯦꯗ ꯑꯦꯂꯥꯔꯠ - ꯂꯦꯕꯦꯜ ꯴',
    evacuateNow: 'ꯊꯨꯅꯥ ꯅꯥꯅꯕ ꯃꯐꯝꯗ ꯆꯠꯂꯨ',
    readOfficialBulletin: 'ꯑꯣꯐꯤꯁꯤꯑꯦꯜ Bulletin ꯄꯥꯕꯤꯌꯨ',
    broadcastSMS: 'SMS ꯊꯥꯕꯤꯌꯨ 📱',
    helplines: 'Emergency Helplines',
    shelters: 'Relief Camps',
  },
  mzo: {
    appTitle: 'LOGIX-NER',
    appSubtitle: 'AI Logistics & Transport Grid',
    dashboard: 'Dashboard',
    alerts: 'Vantlang Warning',
    report: 'Report',
    sensors: 'Sensors',
    settings: 'Settings',
    sosEmergency: 'SOS HLAMAU',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    emergencyContacts: 'Chhungkua & Thiante (Emergency)',
    voiceMicTooltip: 'LOGIX AI Voice Assistant',
    listeningVoice: 'Aw rawl pawh ngaihthlak lai...',
    redAlert: 'RED ALERT - LEVEL 4',
    evacuateNow: 'Insawn nghal rawh',
    readOfficialBulletin: 'Chhiar Rawh Bulletin',
    broadcastSMS: 'Thawn Rawh SMS 📱',
    helplines: 'Emergency Helplines',
    shelters: 'Relief Camps',
  },
  nag: {
    appTitle: 'LOGIX-NER',
    appSubtitle: 'AI Logistics & Accessibility Grid',
    dashboard: 'Dashboard',
    alerts: 'Warning Alerts',
    report: 'Report Alert',
    sensors: 'Sensors',
    settings: 'Settings',
    sosEmergency: 'SOS EMERGENCY',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    emergencyContacts: 'Emergency Family & Friends',
    voiceMicTooltip: 'LOGIX AI Command Assistant',
    listeningVoice: 'Listening for voice command...',
    redAlert: 'RED ALERT - LEVEL 4',
    evacuateNow: 'Move to safe place immediately',
    readOfficialBulletin: 'Read Official Bulletin',
    broadcastSMS: 'Broadcast via SMS 📱',
    helplines: 'Emergency Helplines',
    shelters: 'Relief Camps',
  },
  kok: {
    appTitle: 'LOGIX-NER',
    appSubtitle: 'AI Logistics & Route Grid',
    dashboard: 'Dashboard',
    alerts: 'Warning',
    report: 'Report',
    sensors: 'Sensors',
    settings: 'Settings',
    sosEmergency: 'SOS DANGER',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    emergencyContacts: 'Lok & Nogor (Emergency)',
    voiceMicTooltip: 'LOGIX AI Assistant',
    listeningVoice: 'Khorang Khnagjakphai...',
    redAlert: 'RED ALERT - LEVEL 4',
    evacuateNow: 'Thangbo Safe Place-o',
    readOfficialBulletin: 'Read Official Bulletin',
    broadcastSMS: 'Send SMS 📱',
    helplines: 'Emergency Helplines',
    shelters: 'Relief Camps',
  },
  ne: {
    appTitle: 'LOGIX-NER (लॉजिक्स उत्तर-पूर्व)',
    appSubtitle: 'एआई आपूर्ति र मार्ग सुगमयता ग्रिड',
    dashboard: 'ड्यासबोर्ड',
    alerts: 'चेतावनीहरू',
    report: 'रिपोर्ट पठाउनुहोस्',
    sensors: 'सेन्সার डाटा',
    settings: 'सेटिङ्हरू',
    sosEmergency: 'आपत्कालीन एसओएस',
    signIn: 'साइन इन गर्नुहोस्',
    signOut: 'साइन आउट',
    emergencyContacts: 'आपत्कालीन सम्पर्कहरू (परिवार र साथीहरू)',
    voiceMicTooltip: 'LOGIX voice AI सहायक',
    listeningVoice: 'क्षेत्रीय आवाज आदेश सुन्दैछ...',
    redAlert: 'रेड अलर्ट - स्तर ४',
    evacuateNow: 'तुरुन्तै सुरक्षित स्थानमा जानुहोस्',
    readOfficialBulletin: 'आधिकारिक समाचार पढ्नुहोस्',
    broadcastSMS: 'एसएमएस पठाउनुहोस् 📱',
    helplines: 'आपत्कालीन हेल्पलाइनहरू',
    shelters: 'राहत शिविरहरू',
  },
};

const LANGUAGE_KEY = 'logix_selected_language_v1';
let currentLang: LanguageCode = 'en';

export function getSelectedLanguage(): LanguageCode {
  if (typeof window === 'undefined' || !window.localStorage) return currentLang;
  try {
    const saved = window.localStorage.getItem(LANGUAGE_KEY) as LanguageCode;
    if (saved && TRANSLATIONS[saved]) {
      currentLang = saved;
      return saved;
    }
  } catch {}
  return 'en';
}

export function setSelectedLanguage(lang: LanguageCode): void {
  currentLang = lang;
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(LANGUAGE_KEY, lang);
  } catch {}
}

export function getTranslations(lang: LanguageCode = getSelectedLanguage()): TranslationDictionary {
  return TRANSLATIONS[lang] || TRANSLATIONS['en'];
}
