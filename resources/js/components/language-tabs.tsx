import { changeLanguage } from '@/i18n';
import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';

type LanguageOption = {
  value: string;
  label: string;
  direction: 'ltr' | 'rtl';
};

export default function LanguageTabs({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const languageOptions: LanguageOption[] = [
    { value: 'ar', label: 'العربية', direction: 'rtl' },
    { value: 'en', label: 'English', direction: 'ltr' },
  ];

  const handleLanguageChange = (lang: string) => {
    changeLanguage(lang);
  };

  return (
    <div className={cn('inline-flex gap-1 rounded-lg bg-secondary p-1 dark:bg-secondary', className)} {...props}>
      {languageOptions.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => handleLanguageChange(value)}
          className={cn(
            'flex items-center gap-2 justify-center rounded-md px-3.5 py-1.5 transition-colors',
            currentLanguage === value
              ? 'bg-primary text-white shadow-xs'
              : 'text-foreground hover:bg-primary hover:bg-opacity-20 dark:text-foreground',
          )}
        >
          <span className="text-sm">{label}</span>
        </button>
      ))}
    </div>
  );
}