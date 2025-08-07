import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Appearance } from '@/hooks/use-appearance';
import { LucideIcon, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import LoadingSpinner from '@/components/loading-spinner';
import CheckCircleIcon from '@/components/icons/CheckCircleIcon';
import CircleXMarkIcon from '@/components/icons/CircleXMarkIcon';

type PreferencesFormProps = {
  onSuccess?: () => void;
  className?: string;
};

type UserPreferences = {
  theme: number;
  user_lang: string;
};

export default function UserPreferencesForm({ onSuccess, className = '' }: PreferencesFormProps) {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Form state
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 0, // default to light
    user_lang: 'ar', // default to Arabic
  });

  // Load user preferences from server on mount
  useEffect(() => {
    let isMounted = true;
    const fetchPreferences = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/user/preferences');
        
        if (!isMounted) return;
        
        if (response.data.success && response.data.preferences) {
          const serverPreferences = response.data.preferences;
          setPreferences({
            theme: serverPreferences.theme !== null ? serverPreferences.theme : 0,
            user_lang: serverPreferences.user_lang || 'ar',
          });
        }
      } catch (error) {
        if (!isMounted) return;
        
        setMessage({
          type: 'error',
          text: t('messages.update_failed'),
        });
      } finally {
        // Short delay to show loading spinner for better UX
        setTimeout(() => {
          if (isMounted) {
            setLoading(false);
          }
        }, 500);
      }
    };

    fetchPreferences();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [t]);

  const themeOptions: { value: Appearance; icon: LucideIcon; label: string }[] = [
    { value: 'light', icon: Sun, label: t('appearance.light') },
    { value: 'dark', icon: Moon, label: t('appearance.dark') },
  ];

  const languageOptions = [
    { value: 'ar', label: 'العربية', direction: 'rtl' as const },
    { value: 'en', label: 'English', direction: 'ltr' as const },
  ];

  const handleThemeChange = (value: Appearance) => {
    setPreferences({
      ...preferences,
      theme: value === 'dark' ? 1 : 0,
    });
  };

  const handleLanguageChange = (value: string) => {
    setPreferences({
      ...preferences,
      user_lang: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setMessage(null);
      
      // Apply preferences together
      const response = await axios.post('/user/preferences', {
        theme: preferences.theme,
        user_lang: preferences.user_lang,
      });
      
      // Always consider the request as successful when the server responds with status 200
      // Regardless of whether there were actual changes made or not
      if (response.status === 200) {
        // Apply changes to UI regardless
        document.documentElement.classList.toggle('dark', preferences.theme == 1);
        i18n.changeLanguage(preferences.user_lang);
        document.documentElement.dir = preferences.user_lang === 'ar' ? 'rtl' : 'ltr';
        
        // Ensure loading spinner is properly removed
        setTimeout(() => {
          setLoading(false);
          setMessage({
            type: 'success',
            text: t('messages.preferences_updated'),
          });
          
          if (onSuccess) {
            onSuccess();
          }
        }, 500);
        return; // Early return to prevent additional setLoading(false)
      } else {
        // Only if there's an actual server error
        setLoading(false);
        setMessage({
          type: 'error',
          text: t('messages.update_failed'),
        });
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      setLoading(false);
      setMessage({
        type: 'error',
        text: t('messages.update_failed'),
      });
    }
  };

  return (
    <div>
      {loading && (
        <div className="flex items-center justify-center p-8">
          <LoadingSpinner size={48} />
        </div>
      )}
      
      {!loading && (
        <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
          <div className="space-y-4">
            <label className="block text-sm font-medium">
              {t('appearance.theme')}
            </label>
            <div className="inline-flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
              {themeOptions.map(({ value, icon: Icon, label }) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => handleThemeChange(value)}
                  className={cn(
                    'flex items-center gap-2 justify-center rounded-md px-3.5 py-1.5 transition-colors',
                    (preferences.theme == 1 && value === 'dark') || (preferences.theme != 1 && value === 'light')
                      ? 'bg-white shadow-xs dark:bg-neutral-700 dark:text-neutral-100'
                      : 'text-neutral-500 hover:bg-neutral-200/60 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-700/60',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{label}</span>
                </button>
              ))}
            </div>
          </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium">
          {t('appearance.language')}
        </label>
        <div className="inline-flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
          {languageOptions.map(({ value, label }) => (
            <button
              type="button"
              key={value}
              onClick={() => handleLanguageChange(value)}
              className={cn(
                'flex items-center gap-2 justify-center rounded-md px-3.5 py-1.5 transition-colors',
                preferences.user_lang === value
                  ? 'bg-white shadow-xs dark:bg-neutral-700 dark:text-neutral-100'
                  : 'text-neutral-500 hover:bg-neutral-200/60 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-700/60',
              )}
            >
              <span className="text-sm">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div className={cn(
          'text-sm p-3 rounded-md flex items-center gap-2',
          message.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        )}>
          {message.type === 'success' ? (
            <CheckCircleIcon className="w-6 h-6 text-white fill-white flex-shrink-0" style={{color: 'white', fill: 'white'}} />
          ) : (
            <CircleXMarkIcon className="w-6 h-6 text-white fill-white flex-shrink-0" style={{color: 'white', fill: 'white'}} />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
        >
          {loading ? t('buttons.saving') : t('buttons.save_preferences')}
        </button>
      </div>
    </form>
      )}
    </div>
  );
}