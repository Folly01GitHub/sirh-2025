
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { EvaluationResponse } from '@/types/evaluation.types';
import apiClient from '@/utils/apiClient';
import { toast } from 'sonner';

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
  handleSubmitSelfAssessment: () => void;
  handleSubmitEvaluation: () => void;
  handleApprove: (approved: boolean, comment?: string) => void;
  handleResponseChange: (itemId: number, value: string | number | boolean) => void;
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

  // Handle response changes for both employee and evaluator
  const handleResponseChange = (itemId: number, value: string | number | boolean) => {
    // For step 1, update employee responses
    if (currentStep === 1) {
      setEmployeeResponses(prev => {
        const existingIndex = prev.findIndex(r => r.item_id === itemId);
        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = { item_id: itemId, value };
          return updated;
        } else {
          return [...prev, { item_id: itemId, value }];
        }
      });
    }
    // For step 2, update evaluator responses
    else if (currentStep === 2) {
      setEvaluatorResponses(prev => {
        const existingIndex = prev.findIndex(r => r.item_id === itemId);
        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = { item_id: itemId, value };
          return updated;
        } else {
          return [...prev, { item_id: itemId, value }];
        }
      });
    }
  };

  // Handle employee self-assessment submission
  const handleSubmitSelfAssessment = () => {
    setIsSubmitting(true);
    // This is just a placeholder - the actual implementation would be in EvaluationStepOne
    setTimeout(() => {
      setCurrentStep(2);
      setIsSubmitting(false);
      toast.success("Auto-évaluation soumise avec succès");
    }, 1000);
  };

  // Handle evaluator assessment submission
  const handleSubmitEvaluation = () => {
    setIsSubmitting(true);
    // This is just a placeholder - the actual implementation would be in EvaluationStepTwo
    setTimeout(() => {
      setCurrentStep(3);
      setIsSubmitting(false);
      toast.success("Évaluation soumise avec succès");
    }, 1000);
  };

  // Handle final approval/rejection
  const handleApprove = (approved: boolean, comment?: string) => {
    setIsSubmitting(true);
    // This is just a placeholder - the actual implementation would be in EvaluationStepThree
    setTimeout(() => {
      setIsSubmitting(false);
      if (approved) {
        toast.success("Évaluation approuvée avec succès");
      } else {
        toast.error("Évaluation rejetée", { 
          description: comment || "Aucun commentaire fourni"
        });
      }
    }, 1000);
  };

  return (
    <EvaluationContext.Provider value={{
      currentStep, setCurrentStep,
      currentGroupId, setCurrentGroupId,
      employeeResponses, setEmployeeResponses,
      evaluatorResponses, setEvaluatorResponses,
      evaluatorId, setEvaluatorId,
      approverId, setApproverId,
      selectedMissionId, setSelectedMissionId,
      isSubmitting, setIsSubmitting,
      handleSubmitSelfAssessment,
      handleSubmitEvaluation,
      handleApprove,
      handleResponseChange
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
