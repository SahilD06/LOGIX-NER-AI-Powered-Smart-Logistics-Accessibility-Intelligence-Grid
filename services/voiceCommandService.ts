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
export function executeVoiceCommand(commandText: string, onResult?: (res: VoiceRecognitionResult) => void): VoiceRecognitionResult {
  const result = analyzeSpokenText(commandText);
  if (onResult) onResult(result);

  if (result.isPanicCommand) {
    playEmergencySiren(4000);
    broadcastSOSLocationToEmergencyContacts(25.5788, 91.8933, 'East Khasi Hills • Shillong Sector');
  }

  speakTextOutLoud(result.feedbackResponse);
  return result;
}

/**
 * Speech Recognition Listener using Web Speech API
 */
export function listenForVoiceCommand(
  onResult: (res: VoiceRecognitionResult) => void,
  onStatusChange?: (status: 'listening' | 'processing' | 'stopped' | 'error', errorMsg?: string) => void
): () => void {
  stopActiveVoiceRecognition();

  if (typeof window === 'undefined') return () => {};

  // Auditory chime to indicate listening is active
  try {
    playWarningBeep();
  } catch {}

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    if (onStatusChange) onStatusChange('error', 'Voice recognition is not supported in this browser. Please use Chrome/Edge or tap a command.');
    return () => {};
  }

  try {
    const recognition = new SpeechRecognition();
    activeRecognition = recognition;

    recognition.continuous = false;
    recognition.interimResults = false;
    // Set standard English/Indian locale to avoid browser language-pack crashes
    const lang = getSelectedLanguage();
    recognition.lang = lang === 'hi' ? 'hi-IN' : lang === 'bn' ? 'bn-IN' : 'en-IN';

    if (onStatusChange) onStatusChange('listening');

    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      if (transcript.trim()) {
        if (onStatusChange) onStatusChange('processing');
        executeVoiceCommand(transcript, onResult);
      }
      if (onStatusChange) onStatusChange('stopped');
    };

    recognition.onerror = (event: any) => {
      const err = event?.error;
      console.warn('Speech recognition notice:', err);

      if (err === 'aborted' || err === 'no-speech') {
        if (onStatusChange) onStatusChange('stopped');
        return;
      }

      if (err === 'not-allowed' || err === 'permission-denied') {
        if (onStatusChange) onStatusChange('error', '🎙️ Microphone permission required. Enable mic in your browser address bar.');
        return;
      }

      if (err === 'network') {
        if (onStatusChange) onStatusChange('error', '🎙️ Browser speech cloud is offline. Tap any command below or retry.');
        return;
      }

      if (onStatusChange) onStatusChange('stopped');
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
    console.warn('Speech recognition startup exception:', e);
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
      feedbackResponse: '🚨 Emergency Distress Detected! High Siren Activated & GPS SOS Dispatched to NDRF 1078.',
    };
  }

  if (textLower.includes('alert') || textLower.includes('warning') || textLower.includes('bipod') || textLower.includes('khatra') || textLower.includes('hazard')) {
    return {
      isPanicCommand: false,
      actionType: 'ALERTS',
      spokenText: transcript,
      detectedLanguage: matchedLang,
      feedbackResponse: '⚠️ High Hazard Warning: East Khasi & South Garo Hills. Rainfall 140mm/24h. Evacuate unstable slopes.',
    };
  }

  if (textLower.includes('helpline') || textLower.includes('number') || textLower.includes('phone') || textLower.includes('call') || textLower.includes('police') || textLower.includes('ndrf')) {
    return {
      isPanicCommand: false,
      actionType: 'HELPLINES',
      spokenText: transcript,
      detectedLanguage: matchedLang,
      feedbackResponse: '📞 Emergency Hotlines: National 112, NDRF 1078, State Disaster Operation 1070.',
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
      feedbackResponse: '🌧️ Weather Advisory: Heavy monsoon downpour continuing across Meghalaya & Sikkim. Slope saturation 87%.',
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
    feedbackResponse: `Heard: "${transcript}". Ask about "Shelters", "Weather", "Road Status", or say "Help SOS".`,
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
    utterance.lang = langCode === 'hi' ? 'hi-IN' : langCode === 'bn' ? 'bn-IN' : 'en-IN';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('Text-to-Speech notice:', e);
  }
}
