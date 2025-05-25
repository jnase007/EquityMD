import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PageLoader } from '../components/LoadingSpinner';

interface LoadingContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  loadingText: string;
  setLoadingText: (text: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

interface LoadingProviderProps {
  children: ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading...');

  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading, loadingText, setLoadingText }}>
      {children}
      {isLoading && <PageLoader text={loadingText} />}
    </LoadingContext.Provider>
  );
} 