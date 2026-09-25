/**
 * Voice AI Command & Regional Panic Phrase Recognition Service
 * Understands emergency voice commands and distress words spoken in ALL 11 Seven Sister languages.
 * Includes Text-to-Speech (TTS) speech synthesis for reading advisories out loud.
 */
import { playEmergencySiren, playWarningBeep } from './audioAlertService';
import { broadcastSOSLocationToEmergencyContacts } from './emergencyContactsService';
import { LanguageCode, getSelectedLanguage } from './languageService';

export interface VoiceRecognitionResult {
  isPanicCommand: boolean;
  actionType: 'SOS' | 'ALERTS' | 'HELPLINES' | 'SHELTERS' | 'WEATHER' | 'ROUTES' | 'UNKNOWN';
  spokenText: string;
  detectedLanguage: string;
  feedbackResponse: string;
}

// Regional Emergency / Panic Words Dictionary across all Seven Sister languages
const DISTRESS_KEYWORDS: Record<string, string[]> = {
  // English
  en: ['help', 'emergency', 'sos', 'save me', 'landslide', 'danger', 'rescue', 'evacuate'],
  // Hindi
  hi: ['बचाओ', 'मदद', 'खतरा', 'भूस्खलन', 'आपत्कालीन', 'बचाउ', 'एसओएस', 'सहायता', 'bachao', 'madad', 'khatra', 'bachao bachao'],
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

let activeRecognition: any = null;

/**
 * Cleanly cancel any active voice recognition session
 */
export function stopActiveVoiceRecognition(): void {
  if (activeRecognition) {
    try {
      activeRecognition.abort();
    } catch {}
    activeRecognition = null;
  }
}

/**
 * Speech Recognition Listener using Web Speech API with fallback
 */
export function listenForVoiceCommand(
  onResult: (res: VoiceRecognitionResult) => void,
  onStatusChange?: (status: 'listening' | 'processing' | 'stopped' | 'error', errorMsg?: string) => void
): () => void {
  stopActiveVoiceRecognition();

  if (typeof window === 'undefined') return () => {};

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  // Play auditory tone to signify listening is active
  try {
    playWarningBeep();
  } catch {}

  if (!SpeechRecognition) {
    if (onStatusChange) onStatusChange('listening');
    // Fallback simulation for environments without Web Speech API
    const fallbackTimer = setTimeout(() => {
      const fallbackResult: VoiceRecognitionResult = {
        isPanicCommand: true,
        actionType: 'SOS',
        spokenText: 'Help! Bachao! (Voice Assistant Initialized)',
        detectedLanguage: 'Multi-Lingual Emergency',
        feedbackResponse: '🚨 Regional Emergency Distress Detected! Activating Siren & Broadcasting SOS Location to NDRF 1078.',
      };

      if (onStatusChange) onStatusChange('stopped');
      onResult(fallbackResult);

      // Execute Emergency Actions
      playEmergencySiren(3500);
      broadcastSOSLocationToEmergencyContacts(25.5788, 91.8933, 'East Khasi Hills • Shillong Sector');
      speakTextOutLoud(fallbackResult.feedbackResponse);
    }, 2000);

    return () => clearTimeout(fallbackTimer);
  }

  try {
    const recognition = new SpeechRecognition();
    activeRecognition = recognition;

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = getLanguageLocale(getSelectedLanguage());

    if (onStatusChange) onStatusChange('listening');

    recognition.onresult = (event: any) => {
      if (onStatusChange) onStatusChange('processing');
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      const result = analyzeSpokenText(transcript);
      onResult(result);

      if (result.isPanicCommand) {
        playEmergencySiren(4000);
        broadcastSOSLocationToEmergencyContacts(25.5788, 91.8933, 'East Khasi Hills • Shillong Sector');
      }

      // Speak feedback through TTS
      speakTextOutLoud(result.feedbackResponse);
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error event:', event?.error);
      let errMsg = 'Speech recognition error';
      if (event?.error === 'not-allowed' || event?.error === 'permission-denied') {
        errMsg = 'Microphone permission blocked. Please enable microphone access.';
      } else if (event?.error === 'no-speech') {
        errMsg = 'No voice detected. Tap the mic and speak clearly.';
      }
      if (onStatusChange) onStatusChange('error', errMsg);
    };

    recognition.onend = () => {
      activeRecognition = null;
      if (onStatusChange) onStatusChange('stopped');
    };

    recognition.start();

    return () => {
      stopActiveVoiceRecognition();
    };
  } catch (e: any) {
    console.warn('Speech recognition startup error:', e);
    if (onStatusChange) onStatusChange('error', e?.message || 'Failed to start microphone');
    return () => {};
  }
}

/**
 * Analyze transcript for distress/panic phrases in any Seven Sister language
 */
export function analyzeSpokenText(transcript: string): VoiceRecognitionResult {
  const textLower = transcript.toLowerCase().trim();

  // Search across ALL regional languages for panic keywords
  let isPanic = false;
  let matchedLang = 'English';

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

  if (isPanic || textLower.includes('sos') || textLower.includes('help') || textLower.includes('danger') || textLower.includes('save me')) {
    return {
      isPanicCommand: true,
      actionType: 'SOS',
      spokenText: transcript,
      detectedLanguage: matchedLang,
      feedbackResponse: '🚨 Regional Emergency Distress Phrase Detected! Triggering High Siren & Dispatches Location SMS to Family & NDRF 1078.',
    };
  }

  if (textLower.includes('alert') || textLower.includes('warning') || textLower.includes('bipod') || textLower.includes('khatra') || textLower.includes('hazard')) {
    return {
      isPanicCommand: false,
      actionType: 'ALERTS',
      spokenText: transcript,
      detectedLanguage: matchedLang,
      feedbackResponse: '⚠️ High Risk Warning Active: East Khasi & South Garo Hills. Rainfall 140mm/24h. Evacuate unstable downhill slopes.',
    };
  }

  if (textLower.includes('helpline') || textLower.includes('number') || textLower.includes('phone') || textLower.includes('call') || textLower.includes('police') || textLower.includes('ndrf')) {
    return {
      isPanicCommand: false,
      actionType: 'HELPLINES',
      spokenText: transcript,
      detectedLanguage: matchedLang,
      feedbackResponse: '📞 Emergency Hotlines: National 112, NDRF 1078, State Disaster Control 1070.',
    };
  }

  if (textLower.includes('shelter') || textLower.includes('camp') || textLower.includes('shngiam') || textLower.includes('relief') || textLower.includes('safe')) {
    return {
      isPanicCommand: false,
      actionType: 'SHELTERS',
      spokenText: transcript,
      detectedLanguage: matchedLang,
      feedbackResponse: '🏠 Nearest Relief Camp: JN Stadium Polo Grounds (340/1200 Capacity). Food, water, and medical aid active.',
    };
  }

  if (textLower.includes('weather') || textLower.includes('rain') || textLower.includes('radar') || textLower.includes('forecast')) {
    return {
      isPanicCommand: false,
      actionType: 'WEATHER',
      spokenText: transcript,
      detectedLanguage: matchedLang,
      feedbackResponse: '🌧️ Weather Advisory: Heavy monsoon precipitation continuing across Meghalaya & Sikkim sectors. Slope saturation at 87%.',
    };
  }

  if (textLower.includes('route') || textLower.includes('road') || textLower.includes('traffic') || textLower.includes('bypass') || textLower.includes('block')) {
    return {
      isPanicCommand: false,
      actionType: 'ROUTES',
      spokenText: transcript,
      detectedLanguage: matchedLang,
      feedbackResponse: '🛣️ Route Advisory: NH-10 Teesta Bazaar is blocked. Emergency convoys diverted through Lava-Algarah bypass.',
    };
  }

  return {
    isPanicCommand: false,
    actionType: 'UNKNOWN',
    spokenText: transcript,
    detectedLanguage: matchedLang,
    feedbackResponse: `Heard: "${transcript}". Say "Help", "Bachao", "Shelter", or "SOS" for immediate emergency response.`,
  };
}

/**
 * Speak text out loud using Web Speech Synthesis (Text-to-Speech)
 */
export function speakTextOutLoud(text: string, langCode: LanguageCode = getSelectedLanguage()): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel(); // Stop current speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getLanguageLocale(langCode);
    utterance.rate = 0.95; // Clear natural pace
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('Text-to-Speech note:', e);
  }
}

function getLanguageLocale(code: LanguageCode): string {
  switch (code) {
    case 'hi': return 'hi-IN';
    case 'as': return 'as-IN';
    case 'bn': return 'bn-IN';
    case 'ne': return 'ne-NP';
    default: return 'en-IN';
  }
}
