
import React from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CriteriaItem, EvaluationResponse, Employee } from '@/types/evaluation.types';
import StaffSelector from './selectors/StaffSelector';
import MissionSelector from './selectors/MissionSelector';
import CriteriaResponseForm from './forms/CriteriaResponseForm';

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
        <StaffSelector
          label="Évaluateur"
          employees={employees}
          onSelect={onEvaluatorChange}
        />
        <StaffSelector
          label="Approbateur"
          employees={employees}
          onSelect={onApproverChange}
        />
        <MissionSelector
          onSelect={onMissionChange}
          defaultValue={selectedMissionId?.toString()}
        />
      </div>

      <CriteriaResponseForm
        criteriaItems={criteriaItems}
        onResponseChange={onResponseChange}
        responses={responses}
      />

      <Button onClick={onSubmit} className="w-full md:w-auto" disabled={isLoading}>
        Soumettre l'auto-évaluation
      </Button>
    </div>
  );
};

export default EvaluationStepOne;
