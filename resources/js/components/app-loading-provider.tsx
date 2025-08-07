import React, { useState, useEffect, createContext, useContext } from 'react';
import { router } from '@inertiajs/react';
import LoadingOverlay from './loading-overlay';

type LoadingContextType = {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

type LoadingProviderProps = {
  children: React.ReactNode;
};

export default function AppLoadingProvider({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Listen to Inertia page visits
  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleFinish = () => setIsLoading(false);

    router.on('start', handleStart);
    router.on('finish', handleFinish);

    return () => {
      router.off('start', handleStart);
      router.off('finish', handleFinish);
    };
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
      {/* Loading overlay removed in favor of Inertia's default progress bar */}
    </LoadingContext.Provider>
  );
}