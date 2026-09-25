/**
 * Voice AI Command & Regional Panic Phrase Recognition Service
 * Understands emergency voice commands and distress words spoken in ALL 11 Seven Sister languages.
 * Includes Text-to-Speech (TTS) speech synthesis localized to the selected language.
 */
import { playEmergencySiren, playWarningBeep } from './audioAlertService';
import { broadcastSOSLocationToEmergencyContacts } from './emergencyContactsService';
import { LanguageCode, getSelectedLanguage, getTranslations } from './languageService';

export interface VoiceRecognitionResult {
  isPanicCommand: boolean;
  actionType: 'SOS' | 'ALERTS' | 'HELPLINES' | 'SHELTERS' | 'WEATHER' | 'ROUTES' | 'MEDICAL' | 'UNKNOWN';
  spokenText: string;
  detectedLanguage: string;
  feedbackResponse: string;
}

// Regional Emergency / Panic Words Dictionary across all Seven Sister languages
const DISTRESS_KEYWORDS: Record<string, string[]> = {
  // English
  en: ['help', 'emergency', 'sos', 'save me', 'landslide', 'danger', 'rescue', 'evacuate'],
  // Hindi
  hi: ['बचाओ', 'मदद', 'खतरा', 'भूस्खलन', 'आपत्कालीन', 'बचाउ', 'एसओएस', 'सहायता', 'bachao', 'madad', 'khatra'],
  // Assamese
  as: ['সহায়', 'বিপদ', 'মাটি খহা', 'আপদ', 'ৰক্ষা কৰক', 'sohay', 'bipod', 'mati khoha'],
  // Bengali
  bn: ['বাঁচাও', 'সাহায্য', 'পাহাড় ধস', 'বিপদ', 'জরুরি', 'bachao', 'sahajjo', 'pahar dhos'],
  // Khasi
  kha: ['yarap', 'jingeh', 'jingpluh', 'jingma', 'shngiam'],
  // Garo
  gar: ['dakbo', 'a·gop', 'kenani', 're·angbo', 'salbo'],
  // Manipuri / Meitei
  mni: ['matenbangou', 'khang-hapu', 'chingrum', 'kanbiyu', 'tuba'],
  // Mizo
  mzo: ['tanpui', 'puih', 'hlamau', 'min', 'lirtu'],
  // Nagamese
  nag: ['holep', 'bipod', 'khatra', 'bachabo'],
  // Kokborok
  kok: ['chuba', 'kwtal', 'hachuk', 'dok'],
  // Nepali
  ne: ['गुहार', 'बचाऊ', 'पहिरो', 'खतरा', 'आपत', 'guhar', 'bachau', 'pahiro'],
};

/**
 * Execute an AI voice command and return the localized response in the active language
 */
export function executeVoiceCommand(
  commandText: string,
  langCode: LanguageCode = getSelectedLanguage(),
  onResult?: (res: VoiceRecognitionResult) => void
): VoiceRecognitionResult {
  const result = analyzeSpokenText(commandText, langCode);
  if (onResult) onResult(result);

  if (result.isPanicCommand) {
    playEmergencySiren(4000);
    broadcastSOSLocationToEmergencyContacts(25.5788, 91.8933, 'East Khasi Hills • Shillong Sector');
  }

  speakTextOutLoud(result.feedbackResponse, langCode);
  return result;
}

/**
 * Analyze text for queries/distress phrases and return localized feedback
 */
export function analyzeSpokenText(transcript: string, langCode: LanguageCode = getSelectedLanguage()): VoiceRecognitionResult {
  const textLower = transcript.toLowerCase().trim();
  const t = getTranslations(langCode);

  // Search across ALL regional languages for panic keywords
  let isPanic = false;
  let matchedLang = langCode.toUpperCase();

  for (const [lang, keywords] of Object.entries(DISTRESS_KEYWORDS)) {
    for (const kw of keywords) {
      if (textLower.includes(kw.toLowerCase())) {
        isPanic = true;
        matchedLang = lang.toUpperCase();
        break;
      }
    }
    if (isPanic) break;
  }

  if (isPanic || textLower.includes('sos') || textLower.includes('help') || textLower.includes('danger') || textLower.includes('save me') || textLower.includes('emergency') || textLower.includes('बचाओ') || textLower.includes('বাঁচাও') || textLower.includes('সহায়')) {
    return {
      isPanicCommand: true,
      actionType: 'SOS',
      spokenText: transcript,
      detectedLanguage: matchedLang,
      feedbackResponse: t.responseSos,
    };
  }

  if (textLower.includes('shelter') || textLower.includes('camp') || textLower.includes('shngiam') || textLower.includes('relief') || textLower.includes('safe') || textLower.includes('शिविर') || textLower.includes('আশ্রয়') || textLower.includes('ত্রাণ')) {
    return {
      isPanicCommand: false,
      actionType: 'SHELTERS',
      spokenText: transcript,
      detectedLanguage: matchedLang,
      feedbackResponse: t.responseShelters,
    };
  }

  if (textLower.includes('weather') || textLower.includes('rain') || textLower.includes('radar') || textLower.includes('forecast') || textLower.includes('मौसम') || textLower.includes('বৃষ্টি') || textLower.includes('বৰষুণ') || textLower.includes('slap')) {
    return {
      isPanicCommand: false,
      actionType: 'WEATHER',
      spokenText: transcript,
      detectedLanguage: matchedLang,
      feedbackResponse: t.responseWeather,
    };
  }

  if (textLower.includes('route') || textLower.includes('road') || textLower.includes('traffic') || textLower.includes('bypass') || textLower.includes('block') || textLower.includes('सड़क') || textLower.includes('পথ') || textLower.includes('surok') || textLower.includes('rama') || textLower.includes('kawng')) {
    return {
      isPanicCommand: false,
      actionType: 'ROUTES',
      spokenText: transcript,
      detectedLanguage: matchedLang,
      feedbackResponse: t.responseRoad,
    };
  }

  if (textLower.includes('helpline') || textLower.includes('number') || textLower.includes('phone') || textLower.includes('call') || textLower.includes('police') || textLower.includes('ndrf') || textLower.includes('हेल्पलाइन') || textLower.includes('ফোন')) {
    return {
      isPanicCommand: false,
      actionType: 'HELPLINES',
      spokenText: transcript,
      detectedLanguage: matchedLang,
      feedbackResponse: t.responseHelplines,
    };
  }

  if (textLower.includes('medical') || textLower.includes('convoy') || textLower.includes('medicine') || textLower.includes('food') || textLower.includes('চিকিৎসা') || textLower.includes('दवा') || textLower.includes('dawai')) {
    return {
      isPanicCommand: false,
      actionType: 'MEDICAL',
      spokenText: transcript,
      detectedLanguage: matchedLang,
      feedbackResponse: t.responseMedical,
    };
  }

  return {
    isPanicCommand: false,
    actionType: 'UNKNOWN',
    spokenText: transcript,
    detectedLanguage: matchedLang,
    feedbackResponse: t.responseShelters,
  };
}

/**
 * Speak text out loud using Web Speech Synthesis (Text-to-Speech) in the chosen language voice
 */
export function speakTextOutLoud(text: string, langCode: LanguageCode = getSelectedLanguage()): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel(); // Stop current speech
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Choose appropriate voice locale
    if (langCode === 'hi') {
      utterance.lang = 'hi-IN';
    } else if (langCode === 'bn') {
      utterance.lang = 'bn-IN';
    } else if (langCode === 'as') {
      utterance.lang = 'as-IN';
    } else if (langCode === 'ne') {
      utterance.lang = 'ne-NP';
    } else {
      utterance.lang = 'en-IN';
    }

    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('Text-to-Speech notice:', e);
  }
}
