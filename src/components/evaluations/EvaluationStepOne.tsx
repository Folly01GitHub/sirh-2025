import React, { useState, useEffect, useCallback } from 'react';
import { CriteriaItem, EvaluationResponse } from '@/pages/Evaluation';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/utils/apiClient';

interface EvaluationStepOneProps {
  criteriaItems: CriteriaItem[];
  onResponseChange: (itemId: number, value: string) => void;
  responses: EvaluationResponse[];
  employees: { id: number; name: string; position: string }[];
  onEvaluatorChange: (id: number | null) => void;
  onApproverChange: (id: number | null) => void;
  isLoading: boolean;
  onSubmit: () => void;
}

const fetchAllCriteriaItems = async (): Promise<CriteriaItem[]> => {
  const response = await apiClient.get('/items');
  return response.data;
};

const EvaluationStepOne: React.FC<EvaluationStepOneProps> = ({
  criteriaItems,
  onResponseChange,
  responses,
  employees,
  onEvaluatorChange,
  onApproverChange,
  isLoading,
  onSubmit
}) => {
  const [evaluatorId, setEvaluatorId] = useState<number | null>(null);
  const [approverId, setApproverId] = useState<number | null>(null);
  const [criteriaMissing, setCriteriaMissing] = useState<boolean>(false);
  const [missingFields, setMissingFields] = useState<{ group?: string; label: string }[]>([]);

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

  const handleEvaluatorChange = (value: string) => {
    const id = value ? Number(value) : null;
    setEvaluatorId(id);
    onEvaluatorChange(id);
  };

  const handleApproverChange = (value: string) => {
    const id = value ? Number(value) : null;
    setApproverId(id);
    onApproverChange(id);
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

    if (!evaluatorId || !approverId) {
      setMissingFields([
        { label: "Évaluateur" },
        { label: "Approbateur" }
      ]);
      return false;
    }

    const missing: { group?: string; label: string }[] = [];

    allCriteriaItems.forEach(item => {
      const response = responses.find(r => r.item_id === item.id);
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

  const getResponseValue = useCallback((itemId: number) => {
    const response = responses.find(r => r.item_id === itemId);
    return response ? response.value : "";
  }, [responses]);

  const handleResponseChange = useCallback((itemId: number, value: string | number) => {
    const stringValue = typeof value === 'number' ? value.toString() : value;

    onResponseChange(itemId, stringValue);
  }, [onResponseChange]);

  const renderStarRating = (itemId: number) => {
    const currentValue = Number(getResponseValue(itemId)) || 0;

    return (
      <RadioGroup
        value={currentValue.toString()}
        onValueChange={(value) => handleResponseChange(itemId, parseInt(value))}
        className="flex space-x-2"
      >
        {[1, 2, 3, 4, 5].map((value) => (
          <div key={value} className="flex flex-col items-center">
            <RadioGroupItem
              value={value.toString()}
              id={`rating-${itemId}-${value}`}
              className="sr-only"
            />
            <label
              htmlFor={`rating-${itemId}-${value}`}
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

  const renderBooleanResponse = (itemId: number) => {
    const value = getResponseValue(itemId);

    return (
      <RadioGroup
        value={value ? value.toString() : ""}
        onValueChange={(val) => handleResponseChange(itemId, val)}
        className="flex gap-6"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="oui" id={`oui-${itemId}`} />
          <label htmlFor={`oui-${itemId}`} className="text-sm font-medium">
            Oui
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="non" id={`non-${itemId}`} />
          <label htmlFor={`non-${itemId}`} className="text-sm font-medium">
            Non
          </label>
        </div>
      </RadioGroup>
    );
  };

  const handleSubmit = () => {
    if (!validateAllFields()) {
      setCriteriaMissing(true);
      
      alert('All the fields in all the groups must be filled in');
      
      return;
    }

    console.log("Form validation successful, submitting self-assessment");
    onSubmit();
  };

  return (
    <div className="space-y-8">
      <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
        <p className="text-blue-800">
          Veuillez compléter votre auto-évaluation en remplissant tous les champs ci-dessous.
          Une fois terminée, elle sera envoyée à votre évaluateur pour analyse.
        </p>
      </div>

      {criteriaMissing && missingFields.length > 0 && (
        <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-yellow-800">
            <p className="font-medium mb-2">Tous les champs de tous les groupes doivent être complétés:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {missingFields.slice(0, 5).map((field, idx) => (
                <li key={idx}>
                  <span className="font-medium">{field.group ? `${field.group}: ` : ''}</span>
                  {field.label}
                </li>
              ))}
              {missingFields.length > 5 && (
                <li>...et {missingFields.length - 5} autre(s) champ(s)</li>
              )}
            </ul>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label className="text-sm font-medium">Sélectionnez votre évaluateur</label>
          <Select onValueChange={handleEvaluatorChange} value={evaluatorId?.toString()}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir un évaluateur" />
            </SelectTrigger>
            <SelectContent>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id.toString()}>
                  {employee.name} - {employee.position}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-medium">Sélectionnez l'approbateur final</label>
          <Select onValueChange={handleApproverChange} value={approverId?.toString()}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir un approbateur" />
            </SelectTrigger>
            <SelectContent>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id.toString()}>
                  {employee.name} - {employee.position}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {criteriaItems.map((item) => (
        <div key={item.id} className="p-4 border rounded-md shadow-sm">
          <h3 className="text-lg font-medium mb-4">{item.label}</h3>

          {item.type === 'numeric' ? (
            <div className="mt-4">
              {renderStarRating(item.id)}

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
                value={getResponseValue(item.id)?.toString() || ""}
                onChange={(e) => handleResponseChange(item.id, e.target.value)}
                placeholder="Entrez votre observation…"
                className="min-h-[120px]"
              />
              <div className="text-xs text-right">
                {typeof getResponseValue(item.id) === 'string' && (
                  <span className={`${(getResponseValue(item.id) as string).length >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                    {(getResponseValue(item.id) as string).length} / 50 caractères minimum
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      <Button 
        onClick={handleSubmit} 
        className="w-full md:w-auto" 
        disabled={isLoading}
      >
        Soumettre mon auto-évaluation
      </Button>
    </div>
  );
};

export default EvaluationStepOne;
