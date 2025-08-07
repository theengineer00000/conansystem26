import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function RtlChevron({ className }: { className?: string }) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  return isRTL ? <ChevronLeft className={className} /> : <ChevronRight className={className} />;
}