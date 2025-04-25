
import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the shape of our context
interface EvaluationContextType {
  currentStep: 1 | 2 | 3;
  setCurrentStep: (step: 1 | 2 | 3) => void;
}

// Create the context with default values
const EvaluationContext = createContext<EvaluationContextType>({
  currentStep: 1,
  setCurrentStep: () => {},
});

// Context provider component
interface EvaluationProviderProps {
  children: ReactNode;
}

export const EvaluationProvider: React.FC<EvaluationProviderProps> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  return (
    <EvaluationContext.Provider value={{ 
      currentStep, 
      setCurrentStep 
    }}>
      {children}
    </EvaluationContext.Provider>
  );
};

// Custom hook to use the evaluation context
export const useEvaluationContext = () => useContext(EvaluationContext);
