import React, { useState } from 'react';
import { CriteriaItem, EvaluationResponse } from '@/pages/Evaluation';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Star } from 'lucide-react';

interface EvaluationStepTwoProps {
  criteriaItems: CriteriaItem[];
  onResponseChange: (itemId: number, value: string | number) => void;
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
  const [evaluatorResponses, setEvaluatorResponses] = useState<EvaluationResponse[]>([]);
  
  const getEmployeeResponseValue = (itemId: number) => {
    const response = employeeResponses.find(r => r.item_id === itemId);
    return response ? response.value : "";
  };
  
  const getEvaluatorResponseValue = (itemId: number) => {
    const response = evaluatorResponses.find(r => r.item_id === itemId);
    return response ? response.value : "";
  };
  
  const handleEvaluatorResponseChange = (itemId: number, value: string | number) => {
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
    
    onResponseChange(itemId, value);
  };
  
  const renderEvaluatorStarRating = (itemId: number) => {
    const currentValue = Number(getEvaluatorResponseValue(itemId)) || 0;
    
    return (
      <RadioGroup 
        value={currentValue.toString()} 
        onValueChange={(value) => handleEvaluatorResponseChange(itemId, parseInt(value))}
        className="flex space-x-2"
      >
        {[1, 2, 3, 4, 5].map((value) => (
          <div key={value} className="flex flex-col items-center">
            <RadioGroupItem 
              value={value.toString()} 
              id={`evaluator-rating-${itemId}-${value}`} 
              className="sr-only"
            />
            <label 
              htmlFor={`evaluator-rating-${itemId}-${value}`}
              className="cursor-pointer"
            >
              <Star 
                className={`h-6 w-6 transition-all ${value <= currentValue ? 'fill-primary text-primary' : 'text-gray-300'}`}
              />
            </label>
          </div>
        ))}
      </RadioGroup>
    );
  };
  
  const renderEmployeeStarRating = (itemId: number) => {
    const currentValue = Number(getEmployeeResponseValue(itemId)) || 0;
    
    return (
      <div className="flex space-x-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <div key={value} className="flex flex-col items-center">
            <Star 
              className={`h-6 w-6 ${value <= currentValue ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
            />
          </div>
        ))}
      </div>
    );
  };
  
  const renderBooleanResponse = (itemId: number, isEmployee: boolean = false) => {
    const value = isEmployee ? 
      getEmployeeResponseValue(itemId) as string : 
      getEvaluatorResponseValue(itemId) as string;
    
    if (isEmployee) {
      return (
        <div className="flex gap-6">
          <div className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded-full border ${value === 'oui' ? 'bg-yellow-400 border-yellow-400' : 'border-gray-300'}`} />
            <span className="text-sm">Oui</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded-full border ${value === 'non' ? 'bg-yellow-400 border-yellow-400' : 'border-gray-300'}`} />
            <span className="text-sm">Non</span>
          </div>
        </div>
      );
    }

    return (
      <RadioGroup
        value={value}
        onValueChange={(val) => handleEvaluatorResponseChange(itemId, val)}
        className="flex gap-6"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="oui" id={`evaluator-oui-${itemId}`} />
          <label htmlFor={`evaluator-oui-${itemId}`} className="text-sm font-medium">
            Oui
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="non" id={`evaluator-non-${itemId}`} />
          <label htmlFor={`evaluator-non-${itemId}`} className="text-sm font-medium">
            Non
          </label>
        </div>
      </RadioGroup>
    );
  };
  
  const handleSubmit = () => {
    const formComplete = criteriaItems.every(item => {
      const response = evaluatorResponses.find(r => r.item_id === item.id);
      
      if (item.type === 'numeric') {
        const numericValue = typeof response?.value === 'number' ? response.value : 
                            (typeof response?.value === 'string' ? Number(response.value) : 0);
        return numericValue >= 1 && numericValue <= 5;
      } else if (item.type === 'observation') {
        return response && typeof response.value === 'string' && response.value.length >= 50;
      } else if (item.type === 'boolean') {
        return response && ['oui', 'non'].includes(response.value);
      }
      
      return false;
    });
    
    if (!formComplete) {
      alert("Veuillez compléter tous les champs d'évaluation");
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
        <div key={item.id} className="p-4 border rounded-md shadow-sm">
          <h3 className="text-lg font-medium mb-4">{item.label}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium text-gray-700">Auto-évaluation du collaborateur</h4>
              
              {item.type === 'numeric' ? (
                <div className="mt-4">
                  {renderEmployeeStarRating(item.id)}
                </div>
              ) : item.type === 'boolean' ? (
                <div className="mt-4">
                  {renderBooleanResponse(item.id, true)}
                </div>
              ) : (
                <div className="mt-2">
                  <p className="p-3 bg-gray-100 rounded min-h-[120px] text-gray-600">
                    {getEmployeeResponseValue(item.id) || "Aucune observation fournie"}
                  </p>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-primary">Votre évaluation</h4>
              
              {item.type === 'numeric' ? (
                <div className="mt-4">
                  {renderEvaluatorStarRating(item.id)}
                  
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Débutant</span>
                    <span>Expert</span>
                  </div>
                </div>
              ) : item.type === 'boolean' ? (
                <div className="mt-4">
                  {renderBooleanResponse(item.id)}
                </div>
              ) : (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-2">
                    Minimum 50 caractères
                  </p>
                  <Textarea 
                    value={getEvaluatorResponseValue(item.id) as string}
                    onChange={(e) => handleEvaluatorResponseChange(item.id, e.target.value)}
                    placeholder="Entrez votre observation…"
                    className="min-h-[120px]"
                  />
                  <div className="text-xs text-right">
                    {typeof getEvaluatorResponseValue(item.id) === 'string' && (
                      <span className={`${(getEvaluatorResponseValue(item.id) as string).length >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                        {(getEvaluatorResponseValue(item.id) as string).length} / 50 caractères minimum
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
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
