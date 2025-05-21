
import React from 'react';
import useEvaluationSubmit from '@/hooks/useEvaluationSubmit';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

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

interface EvaluationSubmitHandlerProps {
  formData: EvaluationFormData;
  onCancel: () => void;
}

const EvaluationSubmitHandler: React.FC<EvaluationSubmitHandlerProps> = ({ formData, onCancel }) => {
  const { isSubmitting, progress, submitEvaluation } = useEvaluationSubmit();
  
  const handleSubmit = async () => {
    await submitEvaluation(formData);
  };
  
  return (
    <div className="space-y-4">
      {isSubmitting && (
        <div className="space-y-2">
          <p className="text-center text-sm text-gray-500">
            {progress < 50
              ? "Soumission de votre évaluation..."
              : "Validation de vos réponses..."}
          </p>
          <Progress value={progress} />
        </div>
      )}
      <div className="flex justify-end space-x-2">
        <Button 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Annuler
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Traitement en cours..." : "Soumettre l'évaluation"}
        </Button>
      </div>
    </div>
  );
};

export default EvaluationSubmitHandler;
