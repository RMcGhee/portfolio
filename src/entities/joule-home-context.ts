import React, { createContext, useContext } from 'react';
import { FormData } from './FormData';

// Create the context for form data
interface JouleHomeContextType {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

export const JouleHomeContext = createContext<JouleHomeContextType | undefined>(undefined);

export const useJouleHomeContext = () => {
  const context = useContext(JouleHomeContext);
  if (!context) {
    throw new Error('useJouleHomeContext must be used within a JouleHomeProvider');
  }
  return context;
};
