
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CriteriaItem, EvaluationResponse, CriteriaGroup } from '@/pages/Evaluation';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/utils/apiClient';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EvaluationStepTwoProps {
  criteriaItems: CriteriaItem[];
  onResponseChange: (itemId: number, value: string) => void;
  employeeResponses: EvaluationResponse[];
  isLoading: boolean;
  onSubmit: () => void;
}

const fetchAllCriteriaItems = async (): Promise<CriteriaItem[]> => {
  const response = await apiClient.get('/items');
  return response.data;
};

const EvaluationStepTwo: React.FC<EvaluationStepTwoProps> = ({
  criteriaItems,
  onResponseChange,
  employeeResponses,
  isLoading,
  onSubmit
}) => {
  const [searchParams] = useSearchParams();
  const evaluationId = searchParams.get('id');
  
  // Fetch collaborator's responses - updated to match the pattern from step 1
  const { data: collaboratorResponses = [], isLoading: responsesLoading } = useQuery({
    queryKey: ['collaboratorResponses', evaluationId],
    queryFn: async () => {
      if (!evaluationId) return [];
      try {
        const response = await apiClient.get('/responses', {
          params: { evaluation_id: evaluationId }
        });
        console.log("Collaborator responses fetched:", response.data);
        return response.data || [];
      } catch (error) {
        console.error("Error fetching collaborator responses:", error);
        return [];
      }
    },
    enabled: !!evaluationId
  });
  
  // Create a separate state for evaluator responses
  const [evaluatorResponses, setEvaluatorResponses] = useState<EvaluationResponse[]>([]);
  const [criteriaMissing, setCriteriaMissing] = useState<boolean>(false);
  const [missingFields, setMissingFields] = useState<{ group?: string, label: string }[]>([]);
  
  const { data: allCriteriaItems, isSuccess: allItemsLoaded } = useQuery({
    queryKey: ['allCriteriaItems'],
    queryFn: fetchAllCriteriaItems
  });
  
  useEffect(() => {
    if (criteriaItems.length > 0) {
      setCriteriaMissing(false);
      setMissingFields([]);
    }
  }, [criteriaItems]);
  
  // Get collaborator response values
  const getCollaboratorResponseValue = (itemId: number) => {
    if (!collaboratorResponses || !collaboratorResponses.length) return "";
    const response = collaboratorResponses.find(r => r.item_id === itemId);
    return response ? response.value : "";
  };
  
  // Get evaluator response values
  const getEvaluatorResponseValue = (itemId: number) => {
    const response = evaluatorResponses.find(r => r.item_id === itemId);
    return response ? response.value : "";
  };
  
  // Handle response changes for evaluator
  const handleEvaluatorResponseChange = (itemId: number, value: string | number) => {
    const stringValue = typeof value === 'number' ? value.toString() : value;
    
    setEvaluatorResponses(prev => {
      const existingIndex = prev.findIndex(r => r.item_id === itemId);
      
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = { item_id: itemId, value: stringValue };
        return updated;
      } else {
        return [...prev, { item_id: itemId, value: stringValue }];
      }
    });
    
    onResponseChange(itemId, stringValue);
    
    if (criteriaMissing) {
      setCriteriaMissing(false);
      setMissingFields([]);
    }
  };
  
  const renderCollaboratorStarRating = (itemId: number) => {
    const currentValue = Number(getCollaboratorResponseValue(itemId)) || 0;
    
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
  
  const renderBooleanResponse = (itemId: number, isCollaborator: boolean = false) => {
    const value = isCollaborator ? 
      getCollaboratorResponseValue(itemId) : 
      getEvaluatorResponseValue(itemId);
    
    if (isCollaborator) {
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
        value={value ? value.toString() : ""}
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
  
  const isValidResponse = (response: EvaluationResponse | undefined, type: string): boolean => {
    if (!response) return false;
    
    switch (type) {
      case 'numeric':
        const numericValue = typeof response.value === 'number' ? response.value : 
                          (typeof response.value === 'string' ? Number(response.value) : 0);
        return numericValue >= 1 && numericValue <= 5;
      case 'observation':
        return typeof response.value === 'string' && response.value.length >= 50;
      case 'boolean':
        return typeof response.value === 'string' && ['oui', 'non'].includes(response.value);
      default:
        return false;
    }
  };
  
  const validateAllFields = (): boolean => {
    if (!allItemsLoaded || !allCriteriaItems) {
      console.warn("Cannot validate form - all criteria items not loaded yet");
      return false;
    }
    
    const missing: { group?: string, label: string }[] = [];

    allCriteriaItems.forEach(item => {
      const response = evaluatorResponses.find(r => r.item_id === item.id);
      if (!isValidResponse(response, item.type)) {
        missing.push({
          label: item.label,
          group: item.group_name || `Group ${item.group_id}`
        });
      }
    });

    setMissingFields(missing);
    return missing.length === 0;
  };
  
  const handleSubmit = () => {
    if (!validateAllFields()) {
      console.log("Échec de la validation du formulaire. Champs manquants :", missingFields);
      
      if (missingFields.length > 0) {
        toast.error("Formulaire incomplet", {
          description: `${missingFields.length} champ(s) obligatoire(s) non rempli(s)`,
          duration: 5000
        });
      }
      
      return;
    }

    console.log("Validation du formulaire réussie, soumission de l'évaluation");
    onSubmit();
  };
  
  if (isLoading || responsesLoading) {
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
                  {renderCollaboratorStarRating(item.id)}
                </div>
              ) : item.type === 'boolean' ? (
                <div className="mt-4">
                  {renderBooleanResponse(item.id, true)}
                </div>
              ) : (
                <div className="mt-2">
                  <ScrollArea className="h-[120px] w-full rounded-md">
                    <div className="p-3 bg-gray-100 rounded text-gray-600 whitespace-pre-wrap">
                      {getCollaboratorResponseValue(item.id) || "Aucune observation fournie"}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-primary">Votre évaluation</h4>
              
              {item.type === 'numeric' ? (
                <div className="mt-4">
                  {renderEvaluatorStarRating(item.id)}
                  
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Très insuffisant</span>
                    <span>Excellent</span>
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
                    value={getEvaluatorResponseValue(item.id).toString()}
                    onChange={(e) => handleEvaluatorResponseChange(item.id, e.target.value)}
                    placeholder="Entrez votre observation…"
                    className="min-h-[120px] max-h-[120px] overflow-y-auto"
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
        disabled={isLoading || responsesLoading}
      >
        Soumettre mon évaluation
      </Button>
    </div>
  );
};

export default EvaluationStepTwo;
