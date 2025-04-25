import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
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
import { 
  fetchCriteriaGroups, 
  fetchCriteriaItems, 
  fetchEmployees,
  fetchCollabResponses,
  fetchEvaluatorResponses 
} from '@/services/evaluationService';
import { EvaluationResponse } from '@/types/evaluation.types';

const Evaluation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const evaluationId = searchParams.get('id') ? parseInt(searchParams.get('id') as string) : null;
  const initialStep = searchParams.get('step') ? parseInt(searchParams.get('step') as string) : 1;
  const viewMode = searchParams.get('mode') === 'view';
  
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(initialStep as 1 | 2 | 3);
  const [currentGroupId, setCurrentGroupId] = useState<number>(1);
  const [employeeResponses, setEmployeeResponses] = useState<EvaluationResponse[]>([]);
  const [evaluatorResponses, setEvaluatorResponses] = useState<EvaluationResponse[]>([]);
  const [evaluatorId, setEvaluatorId] = useState<number | null>(null);
  const [approverId, setApproverId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMissionId, setSelectedMissionId] = useState<number | null>(null);

  const { 
    data: criteriaGroups, 
    isLoading: groupsLoading 
  } = useQuery({
    queryKey: ['criteriaGroups'],
    queryFn: fetchCriteriaGroups
  });
  
  const {
    data: criteriaItems,
    isLoading: itemsLoading
  } = useQuery({
    queryKey: ['criteriaItems', currentGroupId],
    queryFn: () => fetchCriteriaItems(currentGroupId),
    enabled: !!currentGroupId
  });
  
  const {
    data: employees,
    isLoading: employeesLoading
  } = useQuery({
    queryKey: ['employees'],
    queryFn: fetchEmployees
  });
  
  const {
    data: collabResponsesData,
    isLoading: collabResponsesLoading
  } = useQuery({
    queryKey: ['collabResponses', evaluationId],
    queryFn: () => fetchCollabResponses(evaluationId as number),
    enabled: !!evaluationId
  });
  
  const {
    data: evaluatorResponsesData,
    isLoading: evaluatorResponsesLoading
  } = useQuery({
    queryKey: ['evaluatorResponses', evaluationId],
    queryFn: () => fetchEvaluatorResponses(evaluationId as number),
    enabled: !!evaluationId && (currentStep === 3 || currentStep === 2)
  });
  
  useEffect(() => {
    if (collabResponsesData && collabResponsesData.length > 0) {
      setEmployeeResponses(collabResponsesData as EvaluationResponse[]);
    }
  }, [collabResponsesData]);
  
  useEffect(() => {
    if (evaluatorResponsesData && evaluatorResponsesData.length > 0) {
      setEvaluatorResponses(evaluatorResponsesData as EvaluationResponse[]);
    }
  }, [evaluatorResponsesData]);
  
  const calculateProgress = useCallback(() => {
    if (!criteriaGroups || criteriaGroups.length === 0) return 0;
    
    const totalGroups = criteriaGroups.length;
    const currentGroupIndex = criteriaGroups.findIndex(group => group.id === currentGroupId);
    
    return Math.round(((currentGroupIndex + 1) / totalGroups) * 100);
  }, [criteriaGroups, currentGroupId]);
  
  const handleGroupChange = useCallback((groupId: number) => {
    setCurrentGroupId(groupId);
  }, []);
  
  const handlePreviousGroup = useCallback(() => {
    if (criteriaGroups && criteriaGroups.length > 0) {
      const currentIndex = criteriaGroups.findIndex(group => group.id === currentGroupId);
      if (currentIndex > 0) {
        setCurrentGroupId(criteriaGroups[currentIndex - 1].id);
      }
    }
  }, [criteriaGroups, currentGroupId]);
  
  const handleNextGroup = useCallback(() => {
    if (criteriaGroups && criteriaGroups.length > 0) {
      const currentIndex = criteriaGroups.findIndex(group => group.id === currentGroupId);
      if (currentIndex < criteriaGroups.length - 1) {
        setCurrentGroupId(criteriaGroups[currentIndex + 1].id);
      }
    }
  }, [criteriaGroups, currentGroupId]);
  
  const handleEmployeeResponseChange = useCallback((itemId: number, value: string | number | boolean) => {
    setEmployeeResponses(prev => {
      const existingIndex = prev.findIndex(response => response.item_id === itemId);
      
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = { item_id: itemId, value };
        return updated;
      } else {
        return [...prev, { item_id: itemId, value }];
      }
    });
  }, []);
  
  const handleEvaluatorResponseChange = useCallback((itemId: number, value: string | number | boolean) => {
    setEvaluatorResponses(prev => {
      const existingIndex = prev.findIndex(response => response.item_id === itemId);
      
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = { item_id: itemId, value };
        return updated;
      } else {
        return [...prev, { item_id: itemId, value }];
      }
    });
  }, []);
  
  const handleSubmitSelfAssessment = useCallback(async () => {
    if (!evaluatorId || !approverId) {
      toast.error("Sélection incomplète", {
        description: "Veuillez sélectionner un évaluateur et un approbateur"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCurrentStep(2);
    } catch (error) {
      console.error("Erreur lors de la soumission de l'auto-évaluation:", error);
      toast.error("Échec de la soumission de l'auto-évaluation", {
        description: "Veuillez réessayer ultérieurement"
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [evaluatorId, approverId, employeeResponses]);
  
  const handleMissionChange = useCallback((id: number) => {
    setSelectedMissionId(id);
  }, []);
  
  const handleSubmitEvaluation = useCallback(async () => {
    setIsSubmitting(true);
    
    try {
      await fetch('http://backend.local.com/api/submit_evaluator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          evaluation_id: evaluationId,
          responses: evaluatorResponses
        })
      });
      
      toast.success("Évaluation soumise", {
        description: "L'approbateur a été notifié"
      });
      
      navigate('/evaluations');
    } catch (error) {
      console.error("Erreur lors de la soumission de l'évaluation:", error);
      toast.error("Échec de la soumission de l'évaluation", {
        description: "Veuillez réessayer ultérieurement"
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [evaluatorResponses, evaluationId, navigate]);
  
  const handleApprove = useCallback(async (approved: boolean, comment?: string) => {
    if (!approved && (!comment || comment.trim().length < 10)) {
      toast.error("Commentaire requis", {
        description: "Veuillez fournir un commentaire détaillé pour le rejet"
      });
      return;
    }
    
    setIsSubmitting(true);
    
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
    } finally {
      setIsSubmitting(false);
    }
  }, [evaluationId, navigate]);

  useEffect(() => {
    if (criteriaGroups && criteriaGroups.length > 0) {
      setCurrentGroupId(criteriaGroups[0].id);
    }
  }, [criteriaGroups]);
  
  const isLoading = 
    groupsLoading || 
    itemsLoading || 
    employeesLoading || 
    (!!evaluationId && (collabResponsesLoading || evaluatorResponsesLoading));
  
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
                        onSubmit={handleSubmitSelfAssessment}
                        onMissionChange={handleMissionChange}
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
