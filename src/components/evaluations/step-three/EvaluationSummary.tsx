
import React from 'react';
import { Star } from 'lucide-react';
import { EvaluationResponse, CriteriaItem } from '@/types/evaluation.types';

interface EvaluationSummaryProps {
  criteriaItems: CriteriaItem[];
  employeeResponses: EvaluationResponse[];
  evaluatorResponses: EvaluationResponse[];
}

const EvaluationSummary: React.FC<EvaluationSummaryProps> = ({
  criteriaItems,
  employeeResponses,
  evaluatorResponses
}) => {
  const getResponseValue = (responses: EvaluationResponse[], itemId: number) => {
    const response = responses.find(r => r.item_id === itemId);
    return response ? response.value : "";
  };

  const renderStarRating = (value: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((starValue) => (
          <Star 
            key={starValue}
            className={`h-5 w-5 ${starValue <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const calculateAverages = () => {
    const numericItems = criteriaItems.filter(item => item.type === 'numeric');
    
    const employeeAvg = numericItems.reduce((sum, item) => {
      const value = Number(getResponseValue(employeeResponses, item.id)) || 0;
      return sum + value;
    }, 0) / (numericItems.length || 1);
    
    const evaluatorAvg = numericItems.reduce((sum, item) => {
      const value = Number(getResponseValue(evaluatorResponses, item.id)) || 0;
      return sum + value;
    }, 0) / (numericItems.length || 1);
    
    return {
      employeeAvg: employeeAvg.toFixed(1),
      evaluatorAvg: evaluatorAvg.toFixed(1)
    };
  };

  const { employeeAvg, evaluatorAvg } = calculateAverages();

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <h3 className="text-xl font-medium mb-4">Résumé de l'évaluation</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">Auto-évaluation</h4>
          <div className="flex items-center">
            <div className="text-3xl font-bold text-yellow-500 mr-3">{employeeAvg}</div>
            {renderStarRating(parseFloat(employeeAvg))}
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium text-primary">Évaluation du manager</h4>
          <div className="flex items-center">
            <div className="text-3xl font-bold text-primary mr-3">{evaluatorAvg}</div>
            {renderStarRating(parseFloat(evaluatorAvg))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationSummary;
