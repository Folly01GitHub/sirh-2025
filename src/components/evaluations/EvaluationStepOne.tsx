import React from "react";
import { CriteriaItem, EvaluationResponse, Employee, Assignment } from "@/pages/Evaluation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

// --- Extend props ---
interface EvaluationStepOneProps {
  criteriaItems: CriteriaItem[];
  onResponseChange: (itemId: number, value: string | number) => void;
  responses: EvaluationResponse[];
  employees: Employee[];
  onEvaluatorChange: (value: number) => void;
  onApproverChange: (value: number) => void;
  isLoading: boolean;
  onSubmit: () => void;
  // --- New Props for assignment field ---
  assignments: Assignment[];
  selectedAssignment: number | null;
  onAssignmentChange: (assignmentId: number) => void;
  assignmentsLoading: boolean;
}

const EvaluationStepOne: React.FC<EvaluationStepOneProps> = ({
  criteriaItems,
  onResponseChange,
  responses,
  employees,
  onEvaluatorChange,
  onApproverChange,
  isLoading,
  onSubmit,
  assignments,
  selectedAssignment,
  onAssignmentChange,
  assignmentsLoading,
}) => {
  // --- Add at the top of the form: Mission selection ---
  return (
    <div className="space-y-8">
      {/* Assignment selector */}
      <div>
        <label htmlFor="assignment-select" className="block text-sm font-semibold mb-2 text-gray-700">
          Mission concernée <span className="text-destructive">*</span>
        </label>
        {assignmentsLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <Select
            value={selectedAssignment ? selectedAssignment.toString() : ""}
            onValueChange={(val) => onAssignmentChange(val ? parseInt(val) : null)}
            disabled={isLoading || assignmentsLoading}
          >
            <SelectTrigger id="assignment-select" aria-label="Sélection de la mission">
              <SelectValue placeholder="Sélectionnez une mission..." />
            </SelectTrigger>
            <SelectContent>
              {assignments && assignments.length > 0 ? (
                assignments.map((a) => (
                  <SelectItem value={a.id.toString()} key={a.id}>
                    {a.titre}
                  </SelectItem>
                ))
              ) : (
                <div className="px-4 py-2 text-muted-foreground text-sm">Aucune mission disponible</div>
              )}
            </SelectContent>
          </Select>
        )}
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Sélectionnez votre évaluateur et votre validateur
        </h2>
        
        {/* Select Evaluator */}
        <div>
          <label htmlFor="evaluator-select" className="block text-sm font-semibold mb-2 text-gray-700">
            Sélectionner l'évaluateur <span className="text-destructive">*</span>
          </label>
          <Select onValueChange={(value) => onEvaluatorChange(parseInt(value))} disabled={isLoading}>
            <SelectTrigger id="evaluator-select" aria-label="Sélectionner l'évaluateur">
              <SelectValue placeholder="Sélectionner l'évaluateur" />
            </SelectTrigger>
            <SelectContent>
              {employees.map((employee) => (
                <SelectItem value={employee.id.toString()} key={employee.id}>
                  {employee.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Select Approver */}
        <div>
          <label htmlFor="approver-select" className="block text-sm font-semibold mb-2 text-gray-700">
            Sélectionner le validateur <span className="text-destructive">*</span>
          </label>
          <Select onValueChange={(value) => onApproverChange(parseInt(value))} disabled={isLoading}>
            <SelectTrigger id="approver-select" aria-label="Sélectionner le validateur">
              <SelectValue placeholder="Sélectionner le validateur" />
            </SelectTrigger>
            <SelectContent>
              {employees.map((employee) => (
                <SelectItem value={employee.id.toString()} key={employee.id}>
                  {employee.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* Wrap the submit area to disable it if assignment not selected */}
      <Button
        onClick={onSubmit}
        className="w-full md:w-auto"
        disabled={isLoading || !selectedAssignment}
      >
        Soumettre mon auto-évaluation
      </Button>
    </div>
  );
};

export default EvaluationStepOne;
