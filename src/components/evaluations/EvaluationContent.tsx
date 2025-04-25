
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import EvaluationHeader from '@/components/evaluations/EvaluationHeader';
import EvaluationStepOne from '@/components/evaluations/EvaluationStepOne';
import EvaluationStepTwo from '@/components/evaluations/EvaluationStepTwo';
import EvaluationStepThree from '@/components/evaluations/EvaluationStepThree';
import EvaluationInstructions from '@/components/evaluations/EvaluationInstructions';
import { useEvaluation } from '@/contexts/EvaluationContext';
import { CriteriaItem } from '@/types/evaluation.types';

interface EvaluationContentProps {
  criteriaItems?: CriteriaItem[];
  isLoading: boolean;
  onPreviousGroup: () => void;
  onNextGroup: () => void;
  canNavigatePrevious: boolean;
  canNavigateNext: boolean;
}

export const EvaluationContent = ({
  criteriaItems,
  isLoading,
  onPreviousGroup,
  onNextGroup,
  canNavigatePrevious,
  canNavigateNext
}: EvaluationContentProps) => {
  const {
    currentStep,
    employeeResponses,
    evaluatorResponses,
    isSubmitting,
    handleSubmitSelfAssessment,
    handleSubmitEvaluation,
    handleApprove
  } = useEvaluation();

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 animate-fade-in">
      <EvaluationHeader currentStep={currentStep} />
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="content">Évaluation</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="animate-fade-in">
            {currentStep === 1 && (
              <EvaluationStepOne 
                criteriaItems={criteriaItems || []}
                isLoading={isLoading || isSubmitting}
                onSubmit={handleSubmitSelfAssessment}
              />
            )}
            
            {currentStep === 2 && (
              <EvaluationStepTwo 
                criteriaItems={criteriaItems || []}
                isLoading={isLoading || isSubmitting}
                onSubmit={handleSubmitEvaluation}
              />
            )}
            
            {currentStep === 3 && (
              <EvaluationStepThree 
                criteriaItems={criteriaItems || []}
                employeeResponses={employeeResponses}
                evaluatorResponses={evaluatorResponses}
                isLoading={isLoading || isSubmitting}
                onApprove={handleApprove}
              />
            )}
          </TabsContent>
          
          <TabsContent value="instructions">
            <EvaluationInstructions currentStep={currentStep} />
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="flex justify-between mt-4">
        <Button
          onClick={onPreviousGroup}
          disabled={!canNavigatePrevious}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-5 w-5 mr-2" />
          Précédent
        </Button>
        
        <Button
          onClick={onNextGroup}
          disabled={!canNavigateNext}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Suivant
          <ChevronRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};
