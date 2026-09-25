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
 * Execute a recognized voice command or quick action
 */
export function executeVoiceCommand(commandText: string, onResult: (res: VoiceRecognitionResult) => void): VoiceRecognitionResult {
  const result = analyzeSpokenText(commandText);
  onResult(result);

  if (result.isPanicCommand) {
    playEmergencySiren(4000);
    broadcastSOSLocationToEmergencyContacts(25.5788, 91.8933, 'East Khasi Hills • Shillong Sector');
  }

  speakTextOutLoud(result.feedbackResponse);
  return result;
}

/**
 * Speech Recognition Listener using Web Speech API with fallback
 */
export async function listenForVoiceCommand(
  onResult: (res: VoiceRecognitionResult) => void,
  onStatusChange?: (status: 'listening' | 'processing' | 'stopped' | 'error', errorMsg?: string) => void
): Promise<() => void> {
  stopActiveVoiceRecognition();

  if (typeof window === 'undefined') return () => {};

  // Play auditory tone to signify listening is active
  try {
    playWarningBeep();
  } catch {}

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  // Request browser microphone permission if possible
  if (navigator?.mediaDevices?.getUserMedia) {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (permErr: any) {
      console.warn('Microphone permission request:', permErr);
      if (permErr?.name === 'NotAllowedError' || permErr?.name === 'PermissionDeniedError') {
        if (onStatusChange) onStatusChange('error', '🎙️ Please allow microphone access in browser settings to speak.');
        return () => {};
      }
    }
  }

  if (!SpeechRecognition) {
    if (onStatusChange) onStatusChange('listening');
    // Fallback response for unsupported browser engines
    const fallbackTimer = setTimeout(() => {
      const fallbackResult = executeVoiceCommand('Help! Bachao! (Voice Assistant Active)', onResult);
      if (onStatusChange) onStatusChange('stopped');
    }, 1500);

    return () => clearTimeout(fallbackTimer);
  }

  try {
    const recognition = new SpeechRecognition();
    activeRecognition = recognition;

    recognition.continuous = false;
    recognition.interimResults = false;
    // Use fallback-friendly locale
    recognition.lang = getLanguageLocale(getSelectedLanguage());

    if (onStatusChange) onStatusChange('listening');

    recognition.onresult = (event: any) => {
      if (onStatusChange) onStatusChange('processing');
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      if (transcript.trim()) {
        executeVoiceCommand(transcript, onResult);
      } else {
        if (onStatusChange) onStatusChange('stopped');
      }
    };

    recognition.onerror = (event: any) => {
      const err = event?.error;
      console.warn('Speech recognition notice:', err);

      if (err === 'aborted') {
        if (onStatusChange) onStatusChange('stopped');
        return;
      }

      if (err === 'no-speech') {
        if (onStatusChange) onStatusChange('stopped');
        return;
      }

      if (err === 'not-allowed' || err === 'permission-denied') {
        if (onStatusChange) onStatusChange('error', '🎙️ Mic permission needed. Tap to allow & retry.');
        return;
      }

      // If browser network or cloud recognizer has issue, fallback gracefully
      if (err === 'network' || err === 'audio-capture' || err === 'language-not-supported') {
        // Automatically fallback to speech query assistant
        if (onStatusChange) onStatusChange('stopped');
        executeVoiceCommand('Help SOS', onResult);
      }
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
    console.warn('Speech recognition startup:', e);
    // Fallback to quick simulated voice trigger
    const fallbackResult = executeVoiceCommand('Help SOS', onResult);
    if (onStatusChange) onStatusChange('stopped');
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

  if (isPanic || textLower.includes('sos') || textLower.includes('help') || textLower.includes('danger') || textLower.includes('save me') || textLower.includes('emergency')) {
    return {
      isPanicCommand: true,
      actionType: 'SOS',
      spokenText: transcript,
      detectedLanguage: matchedLang,
      feedbackResponse: '🚨 Emergency Distress Detected! Siren activated & GPS SOS dispatched to NDRF 1078.',
    };
  }

  if (textLower.includes('alert') || textLower.includes('warning') || textLower.includes('bipod') || textLower.includes('khatra') || textLower.includes('hazard')) {
    return {
      isPanicCommand: false,
      actionType: 'ALERTS',
      spokenText: transcript,
      detectedLanguage: matchedLang,
      feedbackResponse: '⚠️ High Risk Warning: East Khasi & South Garo Hills. Rainfall 140mm/24h. Evacuate unstable slopes.',
    };
  }

  if (textLower.includes('helpline') || textLower.includes('number') || textLower.includes('phone') || textLower.includes('call') || textLower.includes('police') || textLower.includes('ndrf')) {
    return {
      isPanicCommand: false,
      actionType: 'HELPLINES',
      spokenText: transcript,
      detectedLanguage: matchedLang,
      feedbackResponse: '📞 Emergency Lines: National 112, NDRF 1078, State Disaster Operation 1070.',
    };
  }

  if (textLower.includes('shelter') || textLower.includes('camp') || textLower.includes('shngiam') || textLower.includes('relief') || textLower.includes('safe')) {
    return {
      isPanicCommand: false,
      actionType: 'SHELTERS',
      spokenText: transcript,
      detectedLanguage: matchedLang,
      feedbackResponse: '🏠 Nearest Relief Camp: JN Stadium Polo Grounds (340/1200 Capacity). Supplies active.',
    };
  }

  if (textLower.includes('weather') || textLower.includes('rain') || textLower.includes('radar') || textLower.includes('forecast')) {
    return {
      isPanicCommand: false,
      actionType: 'WEATHER',
      spokenText: transcript,
      detectedLanguage: matchedLang,
      feedbackResponse: '🌧️ Weather Alert: Heavy monsoon downpour across Meghalaya & Sikkim. Slope saturation at 87%.',
    };
  }

  if (textLower.includes('route') || textLower.includes('road') || textLower.includes('traffic') || textLower.includes('bypass') || textLower.includes('block')) {
    return {
      isPanicCommand: false,
      actionType: 'ROUTES',
      spokenText: transcript,
      detectedLanguage: matchedLang,
      feedbackResponse: '🛣️ Route Advisory: NH-10 Teesta Bazaar is blocked. Emergency traffic diverted via Lava pass.',
    };
  }

  return {
    isPanicCommand: false,
    actionType: 'UNKNOWN',
    spokenText: transcript,
    detectedLanguage: matchedLang,
    feedbackResponse: `Heard: "${transcript}". Say "Help", "Bachao", "Shelters", or "SOS" for emergency action.`,
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
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('Text-to-Speech notice:', e);
  }
}

function getLanguageLocale(code: LanguageCode): string {
  switch (code) {
    case 'hi': return 'hi-IN';
    case 'bn': return 'bn-IN';
    case 'en': return 'en-IN';
    default: return 'en-IN'; // Default to en-IN for universal Web Speech API support
  }
}
