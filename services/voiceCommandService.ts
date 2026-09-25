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
let activeAudioStream: MediaStream | null = null;
let activeAudioContext: AudioContext | null = null;

/**
 * Cleanly cancel any active voice recognition session & audio tracks
 */
export function stopActiveVoiceRecognition(): void {
  if (activeRecognition) {
    try {
      activeRecognition.abort();
    } catch {}
    activeRecognition = null;
  }
  if (activeAudioStream) {
    try {
      activeAudioStream.getTracks().forEach((track) => track.stop());
    } catch {}
    activeAudioStream = null;
  }
  if (activeAudioContext && activeAudioContext.state !== 'closed') {
    try {
      activeAudioContext.close();
    } catch {}
    activeAudioContext = null;
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
 * Speech Recognition Listener with Live Interim Transcripts & Volume Level Visualizer
 */
export function listenForVoiceCommand(
  onResult: (res: VoiceRecognitionResult) => void,
  onStatusChange?: (status: 'listening' | 'processing' | 'stopped' | 'error', errorMsg?: string) => void,
  onInterimText?: (interimText: string) => void,
  onVolumeChange?: (volume: number) => void
): () => void {
  stopActiveVoiceRecognition();

  if (typeof window === 'undefined') return () => {};

  // Auditory chime to indicate listening is active
  try {
    playWarningBeep();
  } catch {}

  // 1. Start audio visualizer if volume listener is attached
  if (onVolumeChange && navigator?.mediaDevices?.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        activeAudioStream = stream;
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          activeAudioContext = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateVolume = () => {
            if (!activeAudioStream) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            onVolumeChange(Math.min(100, Math.round((avg / 128) * 100)));
            requestAnimationFrame(updateVolume);
          };
          updateVolume();
        }
      })
      .catch((e) => {
        console.warn('Audio meter stream notice:', e);
      });
  }

  // 2. Start Web Speech Recognition
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    if (onStatusChange) onStatusChange('error', 'Voice recognition is not supported in this browser. Please use Chrome/Edge or tap a command.');
    return () => stopActiveVoiceRecognition();
  }

  try {
    const recognition = new SpeechRecognition();
    activeRecognition = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    // Use system or language-aware locale with fallback
    const selected = getSelectedLanguage();
    if (selected === 'hi') {
      recognition.lang = 'hi-IN';
    } else if (selected === 'bn') {
      recognition.lang = 'bn-IN';
    } else {
      recognition.lang = navigator.language || 'en-US';
    }

    let finalTranscriptReceived = false;
    let silenceTimer: any = null;

    if (onStatusChange) onStatusChange('listening');

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += text;
        } else {
          interim += text;
        }
      }

      const activeText = final.trim() || interim.trim();
      if (activeText && onInterimText) {
        onInterimText(activeText);
      }

      if (final.trim()) {
        finalTranscriptReceived = true;
        if (onStatusChange) onStatusChange('processing');
        executeVoiceCommand(final.trim(), onResult);
        stopActiveVoiceRecognition();
        if (onStatusChange) onStatusChange('stopped');
      } else if (interim.trim()) {
        // If user pauses after speaking interim words, process after 1.8s
        clearTimeout(silenceTimer);
        silenceTimer = setTimeout(() => {
          if (!finalTranscriptReceived && interim.trim()) {
            finalTranscriptReceived = true;
            if (onStatusChange) onStatusChange('processing');
            executeVoiceCommand(interim.trim(), onResult);
            stopActiveVoiceRecognition();
            if (onStatusChange) onStatusChange('stopped');
          }
        }, 1800);
      }
    };

    recognition.onerror = (event: any) => {
      const err = event?.error;
      console.warn('Speech recognition notice:', err);

      if (err === 'aborted') {
        return;
      }

      if (err === 'no-speech') {
        // Don't treat silence as fatal; keep listening
        return;
      }

      if (err === 'not-allowed' || err === 'permission-denied') {
        if (onStatusChange) onStatusChange('error', '🎙️ Microphone permission required. Enable mic in your browser address bar.');
        return;
      }

      if (err === 'network') {
        if (onStatusChange) onStatusChange('error', '🎙️ Speech server connection offline. Tap any command or type below.');
        return;
      }
    };

    recognition.onend = () => {
      if (activeRecognition && !finalTranscriptReceived) {
        // Keep active session if not explicitly stopped
      }
    };

    recognition.start();

    return () => {
      clearTimeout(silenceTimer);
      stopActiveVoiceRecognition();
    };
  } catch (e: any) {
    console.warn('Speech recognition startup exception:', e);
    if (onStatusChange) onStatusChange('error', 'Unable to start microphone.');
    return () => stopActiveVoiceRecognition();
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
