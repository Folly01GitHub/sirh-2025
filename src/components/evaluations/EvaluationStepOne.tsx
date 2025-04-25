import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CriteriaItem, EvaluationResponse, Employee } from '@/types/evaluation.types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface EvaluationStepOneProps {
  criteriaItems: CriteriaItem[];
  onResponseChange: (itemId: number, value: string | number | boolean) => void;
  employees: Employee[];
  onEvaluatorChange: (employeeId: number) => void;
  onApproverChange: (employeeId: number) => void;
  isLoading: boolean;
  onSubmit: () => void;
  onMissionChange: (id: number) => void;
  selectedMissionId: number | null;
  responses: EvaluationResponse[];
}

const EvaluationStepOne: React.FC<EvaluationStepOneProps> = ({
  criteriaItems,
  onResponseChange,
  employees,
  onEvaluatorChange,
  onApproverChange,
  isLoading,
  onSubmit,
  onMissionChange,
  selectedMissionId,
  responses
}) => {
  const [localResponses, setLocalResponses] = React.useState<EvaluationResponse[]>(responses);
  const [evaluatorId, setEvaluatorId] = React.useState<number | null>(null);
  const [approverId, setApproverId] = React.useState<number | null>(null);
  const [missionId, setMissionId] = React.useState<number | null>(null);

  const handleResponseChange = (itemId: number, value: string | number | boolean) => {
    setLocalResponses(prev => {
      const existingIndex = prev.findIndex(response => response.item_id === itemId);
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = { item_id: itemId, value };
        return updated;
      }
      return [...prev, { item_id: itemId, value }];
    });
    onResponseChange(itemId, value);
  };

  const handleSubmit = () => {
    onSubmit();
  };

  const handleEvaluatorChange = (employeeId: number) => {
    setEvaluatorId(employeeId);
    onEvaluatorChange(employeeId);
  };

  const handleApproverChange = (employeeId: number) => {
    setApproverId(employeeId);
    onApproverChange(employeeId);
  };

  const handleMissionChange = (id: number) => {
    setMissionId(id);
    onMissionChange(id);
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="evaluator">Sélectionner un évaluateur</Label>
          <Select onValueChange={(value) => handleEvaluatorChange(parseInt(value))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionner un évaluateur" defaultValue={evaluatorId?.toString()} />
            </SelectTrigger>
            <SelectContent>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id.toString()}>
                  {employee.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="approver">Sélectionner un approbateur</Label>
          <Select onValueChange={(value) => handleApproverChange(parseInt(value))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionner un approbateur" defaultValue={approverId?.toString()} />
            </SelectTrigger>
            <SelectContent>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id.toString()}>
                  {employee.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="mission">Sélectionner une mission</Label>
          <Select onValueChange={(value) => handleMissionChange(parseInt(value))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionner une mission" defaultValue={missionId?.toString()} />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map((id) => (
                <SelectItem key={id} value={id.toString()}>
                  Mission {id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {criteriaItems.map((item) => (
        <div key={item.id} className="space-y-2">
          <Label htmlFor={`item-${item.id}`}>{item.label}</Label>
          {item.type === 'numeric' && (
            <Input
              type="number"
              id={`item-${item.id}`}
              placeholder="Entrez une valeur numérique"
              value={localResponses.find(r => r.item_id === item.id)?.value?.toString() || ''}
              onChange={(e) => handleResponseChange(item.id, Number(e.target.value))}
            />
          )}
          {item.type === 'observation' && (
            <Textarea
              id={`item-${item.id}`}
              placeholder="Entrez votre observation"
              value={localResponses.find(r => r.item_id === item.id)?.value?.toString() || ''}
              onChange={(e) => handleResponseChange(item.id, e.target.value)}
            />
          )}
          {item.type === 'boolean' && (
            <div className="flex items-center space-x-2">
              <Label htmlFor={`item-${item.id}-oui`}>Oui</Label>
              <Input
                type="radio"
                id={`item-${item.id}-oui`}
                name={`item-${item.id}`}
                value="oui"
                checked={localResponses.find(r => r.item_id === item.id)?.value === 'oui'}
                onChange={() => handleResponseChange(item.id, 'oui')}
              />
              <Label htmlFor={`item-${item.id}-non`}>Non</Label>
              <Input
                type="radio"
                id={`item-${item.id}-non`}
                name={`item-${item.id}`}
                value="non"
                checked={localResponses.find(r => r.item_id === item.id)?.value === 'non'}
                onChange={() => handleResponseChange(item.id, 'non')}
              />
            </div>
          )}
        </div>
      ))}

      <Button onClick={handleSubmit} className="w-full md:w-auto" disabled={isLoading}>
        Soumettre l'auto-évaluation
      </Button>
    </div>
  );
};

export default EvaluationStepOne;
