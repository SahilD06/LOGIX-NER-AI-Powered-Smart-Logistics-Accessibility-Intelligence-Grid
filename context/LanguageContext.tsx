import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  LanguageCode,
  LanguageOption,
  TranslationDictionary,
  SUPPORTED_LANGUAGES,
  getSelectedLanguage,
  setSelectedLanguage as persistLanguage,
  getTranslations,
} from '../services/languageService';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: TranslationDictionary;
  activeLangObj: LanguageOption;
  getLocalizedVoiceResponse: (actionType: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>('en');

  useEffect(() => {
    setLanguageState(getSelectedLanguage());
  }, []);

  const handleSetLanguage = (lang: LanguageCode) => {
    persistLanguage(lang);
    setLanguageState(lang);
  };

  const t = getTranslations(language);
  const activeLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const getLocalizedVoiceResponse = (actionType: string): string => {
    switch (actionType) {
      case 'SOS':
        return t.responseSos;
      case 'SHELTERS':
        return t.responseShelters;
      case 'WEATHER':
        return t.responseWeather;
      case 'ROUTES':
        return t.responseRoad;
      case 'HELPLINES':
        return t.responseHelplines;
      case 'MEDICAL':
        return t.responseMedical;
      default:
        return t.responseShelters;
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: handleSetLanguage,
        t,
        activeLangObj,
        getLocalizedVoiceResponse,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    const lang = getSelectedLanguage();
    const t = getTranslations(lang);
    const activeLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0];
    return {
      language: lang,
      setLanguage: persistLanguage,
      t,
      activeLangObj,
      getLocalizedVoiceResponse: () => t.responseShelters,
    };
  }
  return context;
}
