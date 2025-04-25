
import React from 'react';
import { CriteriaItem, EvaluationResponse } from '@/types/evaluation.types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import EvaluationCard from './responses/EvaluationCard';
import { isValidResponse } from '@/utils/evaluationUtils';

interface EvaluationStepTwoProps {
  criteriaItems: CriteriaItem[];
  onResponseChange: (itemId: number, value: string | number | boolean) => void;
  employeeResponses: EvaluationResponse[];
  isLoading: boolean;
  onSubmit: () => void;
}

const EvaluationStepTwo: React.FC<EvaluationStepTwoProps> = ({
  criteriaItems,
  onResponseChange,
  employeeResponses,
  isLoading,
  onSubmit
}) => {
  const [evaluatorResponses, setEvaluatorResponses] = React.useState<EvaluationResponse[]>([]);
  const [missingFields, setMissingFields] = React.useState<{ group?: string, label: string }[]>([]);

  const handleEvaluatorResponseChange = (itemId: number, value: string | number | boolean) => {
    setEvaluatorResponses(prev => {
      const existingIndex = prev.findIndex(r => r.item_id === itemId);
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = { item_id: itemId, value };
        return updated;
      }
      return [...prev, { item_id: itemId, value }];
    });
    onResponseChange(itemId, value);
  };

  const validateAllFields = () => {
    const missing = criteriaItems.filter(item => 
      !isValidResponse(evaluatorResponses.find(r => r.item_id === item.id), item.type)
    ).map(item => ({
      label: item.label,
      group: item.group_name || `Group ${item.group_id}`
    }));

    setMissingFields(missing);
    return missing.length === 0;
  };

  const handleSubmit = () => {
    if (!validateAllFields()) {
      toast.error("Formulaire incomplet", {
        description: `${missingFields.length} champ(s) obligatoire(s) non rempli(s)`,
        duration: 5000
      });
      return;
    }
    onSubmit();
  };

  if (isLoading && criteriaItems.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
        <p className="text-blue-800">
          En tant qu'évaluateur, vous pouvez consulter l'auto-évaluation du collaborateur 
          et saisir votre propre évaluation. Les deux seront affichées côte à côte pour faciliter la comparaison.
        </p>
      </div>

      {criteriaItems.map((item) => (
        <div key={item.id} className="p-4 border rounded-md">
          <h3 className="text-lg font-medium mb-4">{item.label}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EvaluationCard
              item={item}
              responses={employeeResponses}
              readonly
              variant="employee"
            />
            
            <EvaluationCard
              item={item}
              responses={evaluatorResponses}
              onResponseChange={handleEvaluatorResponseChange}
              variant="evaluator"
            />
          </div>
        </div>
      ))}

      <Button 
        onClick={handleSubmit} 
        className="w-full md:w-auto" 
        disabled={isLoading}
      >
        Soumettre mon évaluation
      </Button>
    </div>
  );
};

export default EvaluationStepTwo;
