import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Initialize i18next without user-specific preferences
export const initializeI18n = (userLang?: string) => {
  // If a specific user language is provided, set it as the initial language
  // Priority: database value > localStorage > default 'ar'
  const initialLanguage = userLang || localStorage.getItem('i18nextLng') || 'ar';
  
  
  i18n
    // load translation using http -> see /public/locales
    .use(Backend)
    // detect user language
    .use(LanguageDetector)
    // pass the i18n instance to react-i18next
    .use(initReactI18next)
    // init i18next
    .init({
      lng: initialLanguage, // Use the provided language or fallback
      fallbackLng: 'ar', // Default language
      supportedLngs: ['ar', 'en'], // Only support Arabic and English
      debug: false,
      interpolation: {
        escapeValue: false, // not needed for react as it escapes by default
      },
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json', // Path to translations
      },
      react: {
        useSuspense: false, // Avoids issues during SSR
      },
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
      },
    });

  // Set RTL direction based on language
  document.documentElement.dir = initialLanguage === 'ar' ? 'rtl' : 'ltr';

  return i18n;
};

// Initial setup
const i18nInstance = initializeI18n();

// Function to change language (without saving to server)
export const changeLanguage = async (lang: string) => {
  if (i18nInstance.language !== lang) {
    await i18nInstance.changeLanguage(lang);
    
    // Set RTL/LTR direction
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    
    // Update sidebar positioning based on language direction
    const sidebar = document.querySelector('[data-sidebar="sidebar"]');
    if (sidebar) {
      if (lang === 'ar') {
        sidebar.setAttribute('data-side', 'right');
      } else {
        sidebar.setAttribute('data-side', 'left');
      }
    }
    
    // Apply RTL-specific styles for the entire layout
    if (lang === 'ar') {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }
};

export default i18n;