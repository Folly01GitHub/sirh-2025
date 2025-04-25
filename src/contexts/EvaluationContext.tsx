
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { EvaluationResponse } from '@/types/evaluation.types';

interface EvaluationContextType {
  currentStep: 1 | 2 | 3;
  setCurrentStep: (step: 1 | 2 | 3) => void;
  currentGroupId: number;
  setCurrentGroupId: (id: number) => void;
  employeeResponses: EvaluationResponse[];
  setEmployeeResponses: (responses: EvaluationResponse[]) => void;
  evaluatorResponses: EvaluationResponse[];
  setEvaluatorResponses: (responses: EvaluationResponse[]) => void;
  evaluatorId: number | null;
  setEvaluatorId: (id: number | null) => void;
  approverId: number | null;
  setApproverId: (id: number | null) => void;
  selectedMissionId: number | null;
  setSelectedMissionId: (id: number | null) => void;
  isSubmitting: boolean;
  setIsSubmitting: (isSubmitting: boolean) => void;
}

const EvaluationContext = createContext<EvaluationContextType | undefined>(undefined);

export function EvaluationProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [currentGroupId, setCurrentGroupId] = useState<number>(1);
  const [employeeResponses, setEmployeeResponses] = useState<EvaluationResponse[]>([]);
  const [evaluatorResponses, setEvaluatorResponses] = useState<EvaluationResponse[]>([]);
  const [evaluatorId, setEvaluatorId] = useState<number | null>(null);
  const [approverId, setApproverId] = useState<number | null>(null);
  const [selectedMissionId, setSelectedMissionId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <EvaluationContext.Provider value={{
      currentStep, setCurrentStep,
      currentGroupId, setCurrentGroupId,
      employeeResponses, setEmployeeResponses,
      evaluatorResponses, setEvaluatorResponses,
      evaluatorId, setEvaluatorId,
      approverId, setApproverId,
      selectedMissionId, setSelectedMissionId,
      isSubmitting, setIsSubmitting
    }}>
      {children}
    </EvaluationContext.Provider>
  );
}

export function useEvaluation() {
  const context = useContext(EvaluationContext);
  if (context === undefined) {
    throw new Error('useEvaluation must be used within an EvaluationProvider');
  }
  return context;
}
