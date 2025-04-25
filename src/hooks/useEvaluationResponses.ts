
import { useState, useCallback } from 'react';
import { EvaluationResponse } from '@/types/evaluation.types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const useEvaluationResponses = (
  evaluationId: number | null,
  setCurrentStep: (step: 1 | 2 | 3) => void
) => {
  const navigate = useNavigate();
  const [employeeResponses, setEmployeeResponses] = useState<EvaluationResponse[]>([]);
  const [evaluatorResponses, setEvaluatorResponses] = useState<EvaluationResponse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmployeeResponseChange = useCallback((itemId: number, value: string | number | boolean) => {
    setEmployeeResponses(prev => {
      const existingIndex = prev.findIndex(response => response.item_id === itemId);
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = { item_id: itemId, value };
        return updated;
      }
      return [...prev, { item_id: itemId, value }];
    });
  }, []);

  const handleEvaluatorResponseChange = useCallback((itemId: number, value: string | number | boolean) => {
    setEvaluatorResponses(prev => {
      const existingIndex = prev.findIndex(response => response.item_id === itemId);
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = { item_id: itemId, value };
        return updated;
      }
      return [...prev, { item_id: itemId, value }];
    });
  }, []);

  const handleSubmitSelfAssessment = useCallback(async (evaluatorId: number | null, approverId: number | null) => {
    if (!evaluatorId || !approverId) {
      toast.error("Sélection incomplète", {
        description: "Veuillez sélectionner un évaluateur et un approbateur"
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentStep(2);
    } catch (error) {
      console.error("Erreur lors de la soumission de l'auto-évaluation:", error);
      toast.error("Échec de la soumission de l'auto-évaluation", {
        description: "Veuillez réessayer ultérieurement"
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [setCurrentStep]);

  const handleSubmitEvaluation = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await fetch('http://backend.local.com/api/submit_evaluator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          evaluation_id: evaluationId,
          responses: evaluatorResponses
        })
      });
      
      toast.success("Évaluation soumise", {
        description: "L'approbateur a été notifié"
      });
      
      navigate('/evaluations');
    } catch (error) {
      console.error("Erreur lors de la soumission de l'évaluation:", error);
      toast.error("Échec de la soumission de l'évaluation", {
        description: "Veuillez réessayer ultérieurement"
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [evaluationId, evaluatorResponses, navigate]);

  return {
    employeeResponses,
    setEmployeeResponses,
    evaluatorResponses,
    setEvaluatorResponses,
    isSubmitting,
    handleEmployeeResponseChange,
    handleEvaluatorResponseChange,
    handleSubmitSelfAssessment,
    handleSubmitEvaluation
  };
};
