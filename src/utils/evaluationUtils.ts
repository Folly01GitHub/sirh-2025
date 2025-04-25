
import { EvaluationResponse } from '@/types/evaluation.types';

export const isValidResponse = (response: EvaluationResponse | undefined, type: string): boolean => {
  if (!response) return false;
  
  switch (type) {
    case 'numeric':
      const numericValue = typeof response.value === 'number' ? response.value : 
                        (typeof response.value === 'string' ? Number(response.value) : 0);
      return numericValue >= 1 && numericValue <= 5;
    case 'observation':
      return typeof response.value === 'string' && response.value.length >= 50;
    case 'boolean':
      return typeof response.value === 'string' && ['oui', 'non'].includes(response.value as string);
    default:
      return false;
  }
};

export const getResponseValue = (responses: EvaluationResponse[], itemId: number): string | number | boolean => {
  const response = responses.find(r => r.item_id === itemId);
  return response ? response.value : "";
};
