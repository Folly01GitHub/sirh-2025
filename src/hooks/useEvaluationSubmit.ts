
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import apiClient from '@/utils/apiClient';

// Types pour les réponses d'évaluation
interface EvaluationResponse {
  item_id: string;
  value: string;
}

interface EvaluationFormData {
  mission_id: string;
  evaluator_id: string;
  approver_id: string;
  responses: EvaluationResponse[];
}

interface CollabResponse {
  id_item: string;
  reponse_item: string;
  type_item: string;
}

interface CollabResponsesData {
  mission_id: string;
  evaluator_id: string;
  approver_id: string;
  responses: CollabResponse[];
}

interface UseEvaluationSubmitReturn {
  isSubmitting: boolean;
  progress: number;
  submitEvaluation: (formData: EvaluationFormData) => Promise<void>;
}

const useEvaluationSubmit = (): UseEvaluationSubmitReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  
  const submitEvaluation = async (formData: EvaluationFormData) => {
    setIsSubmitting(true);
    setProgress(0);
    
    try {
      // Simuler une progression pendant l'envoi
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 5, 40));
      }, 100);
      
      // 1. Soumission initiale
      const submission = await apiClient.post('/submit_auto_evaluation', formData);
      const evaluationId = submission.data.evaluation_id;
      
      clearInterval(progressInterval);
      setProgress(50);
      
      // Simuler une progression pendant la récupération
      const secondProgressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 5, 90));
      }, 100);
      
      // 2. Récupération des réponses consolidées
      const { data } = await apiClient.get<CollabResponsesData>(
        `/collab_responses?evaluation_id=${evaluationId}`
      );
      
      clearInterval(secondProgressInterval);
      setProgress(100);
      
      // 3. Stockage temporaire (optionnel)
      sessionStorage.setItem(
        'last_evaluation', 
        JSON.stringify({ 
          missionId: data.mission_id, 
          evaluator: data.evaluator_id, 
          responses: data.responses 
        })
      );
      
      // 4. Redirection
      navigate('/evaluations', { 
        state: { 
          success: true, 
          newEvaluation: data 
        } 
      });
      
      // Afficher un toast de succès
      toast.success("Évaluation soumise avec succès !");
      
    } catch (error: any) {
      console.error('Error submitting evaluation:', error);
      
      // Si l'erreur vient de la soumission, essayons quand même de rediriger
      if (error.config?.url?.includes('/submit_auto_evaluation')) {
        toast.error("Échec de l'enregistrement - Veuillez réessayer");
      } else if (error.config?.url?.includes('/collab_responses')) {
        // Si l'erreur vient de la récupération des données, redirigeons quand même
        navigate('/evaluations', { 
          state: { 
            success: true, 
            partial: true 
          } 
        });
        toast.warning("Évaluation soumise, mais certaines données n'ont pas pu être récupérées");
      } else {
        toast.error("Échec de l'enregistrement - Veuillez réessayer");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    isSubmitting,
    progress,
    submitEvaluation,
  };
};

export default useEvaluationSubmit;
