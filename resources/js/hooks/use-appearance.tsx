import { useCallback, useEffect, useState } from 'react';
import { getUserPreferences } from '@/lib/auth';

export type Appearance = 'light' | 'dark';

const applyTheme = (appearance: Appearance) => {
    const isDark = appearance === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
};

export function initializeTheme(userTheme?: 'dark' | 'light') {
    // ONLY use theme from database, NO default value
    if (!userTheme) {
        return; // Don't apply any theme if no value provided
    }
    
    
    // Force immediate application of theme
    document.documentElement.classList.remove('light', 'dark');
    applyTheme(userTheme);
}

export function useAppearance() {



}
