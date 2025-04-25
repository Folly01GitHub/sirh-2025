
import React from 'react';
import { CriteriaItem, EvaluationResponse } from '@/types/evaluation.types';
import StarRating from '@/components/evaluations/StarRating';
import BooleanResponse from '@/components/evaluations/BooleanResponse';
import ObservationInput from '@/components/evaluations/ObservationInput';
import { getResponseValue } from '@/utils/evaluationUtils';

interface EvaluationCardProps {
  item: CriteriaItem;
  responses: EvaluationResponse[];
  onResponseChange?: (itemId: number, value: string | number | boolean) => void;
  readonly?: boolean;
  variant?: 'employee' | 'evaluator';
}

const EvaluationCard: React.FC<EvaluationCardProps> = ({
  item,
  responses,
  onResponseChange,
  readonly = false,
  variant = 'employee'
}) => {
  const value = getResponseValue(responses, item.id);
  const bgColor = variant === 'employee' ? 'bg-gray-50' : 'bg-blue-50';
  const textColor = variant === 'employee' ? 'text-gray-700' : 'text-primary';

  return (
    <div className={`space-y-2 ${bgColor} p-4 rounded-md`}>
      <h4 className={`font-medium ${textColor}`}>
        {variant === 'employee' ? 'Auto-évaluation du collaborateur' : 'Évaluation du manager'}
      </h4>
      
      {item.type === 'numeric' ? (
        <div className="mt-4">
          <StarRating 
            value={Number(value) || 0}
            onChange={value => onResponseChange?.(item.id, value)}
            readonly={readonly}
          />
        </div>
      ) : item.type === 'boolean' ? (
        <div className="mt-4">
          <BooleanResponse 
            value={String(value)}
            onChange={value => onResponseChange?.(item.id, value)}
            readonly={readonly}
          />
        </div>
      ) : (
        <ObservationInput 
          value={String(value)}
          onChange={value => onResponseChange?.(item.id, value)}
          readonly={readonly}
        />
      )}
    </div>
  );
};

export default EvaluationCard;
