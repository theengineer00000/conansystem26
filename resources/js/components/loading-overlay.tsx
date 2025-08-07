import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import LoadingSpinner from '@/components/loading-spinner';
import { useTranslation } from 'react-i18next';

type LoadingOverlayProps = {
  isLoading: boolean;
  className?: string;
};

export default function LoadingOverlay({ isLoading, className }: LoadingOverlayProps) {
  const { t } = useTranslation();
  // Add a slight delay before showing the loading overlay to avoid flashes
  // during quick transitions
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (isLoading) {
      timeout = setTimeout(() => setShouldShow(true), 200);
    } else {
      setShouldShow(false);
    }
    
    return () => clearTimeout(timeout);
  }, [isLoading]);

  if (!shouldShow) return null;

  return (
    <div 
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        'bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md',
        'transition-all duration-300 ease-in-out',
        className
      )}
      style={{
        WebkitBackdropFilter: 'blur(8px)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="relative flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <LoadingSpinner size={48} />
        </div>
        <div className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
          {t('loading.please_wait')}
        </div>
      </div>
    </div>
  );
}