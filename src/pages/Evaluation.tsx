
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

import HRISNavbar from '@/components/hris/HRISNavbar';
import EvaluationHeader from '@/components/evaluations/EvaluationHeader';
import EvaluationNavigation from '@/components/evaluations/EvaluationNavigation';
import EvaluationStepOne from '@/components/evaluations/EvaluationStepOne';
import EvaluationStepTwo from '@/components/evaluations/EvaluationStepTwo';
import EvaluationStepThree from '@/components/evaluations/EvaluationStepThree';
import EvaluationInstructions from '@/components/evaluations/EvaluationInstructions';

import { useEvaluationData } from '@/hooks/useEvaluationData';
import { useEvaluationNavigation } from '@/hooks/useEvaluationNavigation';
import { useEvaluationResponses } from '@/hooks/useEvaluationResponses';

const Evaluation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const evaluationId = searchParams.get('id') ? parseInt(searchParams.get('id') as string) : null;
  const initialStep = searchParams.get('step') ? parseInt(searchParams.get('step') as string) : 1;
  
  const [evaluatorId, setEvaluatorId] = useState<number | null>(null);
  const [approverId, setApproverId] = useState<number | null>(null);
  const [selectedMissionId, setSelectedMissionId] = useState<number | null>(null);

  const {
    currentStep,
    setCurrentStep,
    currentGroupId,
    calculateProgress,
    handleGroupChange,
    handlePreviousGroup,
    handleNextGroup
  } = useEvaluationNavigation(initialStep, undefined);

  const {
    criteriaGroups,
    criteriaItems,
    employees,
    collabResponsesData,
    evaluatorResponsesData,
    isLoading
  } = useEvaluationData(evaluationId, currentGroupId, currentStep);

  const {
    employeeResponses,
    setEmployeeResponses,
    evaluatorResponses,
    setEvaluatorResponses,
    isSubmitting,
    handleEmployeeResponseChange,
    handleEvaluatorResponseChange,
    handleSubmitSelfAssessment,
    handleSubmitEvaluation
  } = useEvaluationResponses(evaluationId, setCurrentStep);

  useEffect(() => {
    if (collabResponsesData && collabResponsesData.length > 0) {
      setEmployeeResponses(collabResponsesData);
    }
  }, [collabResponsesData]);

  useEffect(() => {
    if (evaluatorResponsesData && evaluatorResponsesData.length > 0) {
      setEvaluatorResponses(evaluatorResponsesData);
    }
  }, [evaluatorResponsesData]);

  useEffect(() => {
    if (criteriaGroups && criteriaGroups.length > 0) {
      handleGroupChange(criteriaGroups[0].id);
    }
  }, [criteriaGroups]);

  const handleApprove = async (approved: boolean, comment?: string) => {
    if (!approved && (!comment || comment.trim().length < 10)) {
      toast.error("Commentaire requis", {
        description: "Veuillez fournir un commentaire détaillé pour le rejet"
      });
      return;
    }

    try {
      await fetch('http://backend.local.com/api/submit_approver', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          evaluation_id: evaluationId,
          approved,
          comment
        })
      });

      if (approved) {
        toast.success("Évaluation approuvée", {
          description: "Le processus d'évaluation est maintenant terminé"
        });
      } else {
        toast.success("Évaluation renvoyée pour révision", {
          description: "L'évaluateur a été notifié"
        });
      }

      navigate('/evaluations');
    } catch (error) {
      console.error("Erreur lors de la finalisation de l'évaluation:", error);
      toast.error("Échec de la finalisation de l'évaluation", {
        description: "Veuillez réessayer ultérieurement"
      });
    }
  };

  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen w-full bg-[#f8f9fc]">
        <HRISNavbar />
        
        <div className="flex flex-1 h-full overflow-hidden">
          <EvaluationNavigation 
            criteriaGroups={criteriaGroups}
            currentGroupId={currentGroupId}
            onGroupChange={handleGroupChange}
            onPreviousGroup={handlePreviousGroup}
            onNextGroup={handleNextGroup}
            progress={calculateProgress()}
          />

          <div className="flex flex-col h-full w-full overflow-auto">
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
                        onResponseChange={handleEmployeeResponseChange}
                        responses={employeeResponses}
                        employees={employees || []}
                        onEvaluatorChange={setEvaluatorId}
                        onApproverChange={setApproverId}
                        isLoading={isLoading || isSubmitting}
                        onSubmit={() => handleSubmitSelfAssessment(evaluatorId, approverId)}
                        onMissionChange={setSelectedMissionId}
                        selectedMissionId={selectedMissionId}
                      />
                    )}
                    
                    {currentStep === 2 && (
                      <EvaluationStepTwo 
                        criteriaItems={criteriaItems || []}
                        onResponseChange={handleEvaluatorResponseChange}
                        employeeResponses={employeeResponses}
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
                <button
                  onClick={handlePreviousGroup}
                  disabled={!criteriaGroups || criteriaGroups.findIndex(g => g.id === currentGroupId) === 0}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5 mr-2" />
                  Précédent
                </button>
                
                <button
                  onClick={handleNextGroup}
                  disabled={!criteriaGroups || criteriaGroups.findIndex(g => g.id === currentGroupId) === (criteriaGroups.length - 1)}
                  className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                  <ChevronRight className="h-5 w-5 ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Evaluation;
