
import React from 'react';
import { CriteriaItem, EvaluationResponse } from '@/types/evaluation.types';
import EvaluationCard from '../responses/EvaluationCard';

interface CriteriaResponseFormProps {
  criteriaItems: CriteriaItem[];
  onResponseChange: (itemId: number, value: string | number | boolean) => void;
  responses: EvaluationResponse[];
}

const CriteriaResponseForm: React.FC<CriteriaResponseFormProps> = ({
  criteriaItems,
  onResponseChange,
  responses
}) => {
  return (
    <div className="space-y-6">
      {criteriaItems.map((item) => (
        <div key={item.id} className="space-y-2">
          <EvaluationCard
            item={item}
            responses={responses}
            onResponseChange={onResponseChange}
            variant="employee"
          />
        </div>
      ))}
    </div>
  );
};

export default CriteriaResponseForm;
