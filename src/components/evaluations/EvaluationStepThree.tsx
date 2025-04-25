
import React from 'react';
import { CriteriaItem, EvaluationResponse } from '@/types/evaluation.types';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import EvaluationCard from './responses/EvaluationCard';
import EvaluationSummary from './step-three/EvaluationSummary';
import ApprovalActions from './step-three/ApprovalActions';

interface EvaluationStepThreeProps {
  criteriaItems: CriteriaItem[];
  employeeResponses: EvaluationResponse[];
  evaluatorResponses: EvaluationResponse[];
  isLoading: boolean;
  onApprove: (approved: boolean, comment?: string) => void;
}

const EvaluationStepThree: React.FC<EvaluationStepThreeProps> = ({
  criteriaItems,
  employeeResponses,
  evaluatorResponses,
  isLoading,
  onApprove
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
      <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
        <p className="text-blue-800">
          En tant qu'approbateur, vous devez valider ou rejeter cette évaluation de mission.
          Vous pouvez consulter les évaluations du collaborateur et du manager côte à côte.
        </p>
      </div>
      
      <EvaluationSummary 
        criteriaItems={criteriaItems}
        employeeResponses={employeeResponses}
        evaluatorResponses={evaluatorResponses}
      />
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="details">
          <AccordionTrigger>
            Voir le détail complet des évaluations
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6 mt-4">
              {criteriaItems.map((item) => (
                <div key={item.id} className="p-4 border rounded-md">
                  <h3 className="text-lg font-medium mb-4">{item.label}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <EvaluationCard 
                      item={item}
                      responses={employeeResponses}
                      readonly
                      variant="employee"
                    />
                    <EvaluationCard 
                      item={item}
                      responses={evaluatorResponses}
                      readonly
                      variant="evaluator"
                    />
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <ApprovalActions 
        onApprove={onApprove}
        isLoading={isLoading}
      />
    </div>
  );
};

export default EvaluationStepThree;
