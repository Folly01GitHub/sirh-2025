import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/utils/apiClient';
import HRISNavbar from '@/components/hris/HRISNavbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Star } from 'lucide-react';
import EvaluationHeader from '@/components/evaluations/EvaluationHeader';
import EvaluationStepOne from '@/components/evaluations/EvaluationStepOne';
import EvaluationStepTwo from '@/components/evaluations/EvaluationStepTwo';
import EvaluationStepThree from '@/components/evaluations/EvaluationStepThree';
import EvaluationInstructions from '@/components/evaluations/EvaluationInstructions';
import { toast } from 'sonner';

// Types for our evaluation data
export interface CriteriaGroup {
  id: number;
  name: string;
}

export interface CriteriaItem {
  id: number;
  type: 'numeric' | 'observation' | 'boolean';
  label: string;
  group_id: number;
  group_name?: string; // Added for better error messaging
}

export interface EvaluationResponse {
  item_id: number;
  value: string | number;
}

export interface Employee {
  id: number;
  name: string;
  email: string;
  position: string;
}

const fetchCriteriaGroups = async (): Promise<CriteriaGroup[]> => {
  const response = await apiClient.get('/groupe_items');
  return response.data;
};

const fetchCriteriaItems = async (groupId: number): Promise<CriteriaItem[]> => {
  const response = await apiClient.get('/items');
  return response.data.filter((item: CriteriaItem) => item.group_id === groupId);
};

const fetchEmployees = async (): Promise<Employee[]> => {
  return [
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', position: 'Frontend Developer' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', position: 'Backend Developer' },
    { id: 3, name: 'Robert Johnson', email: 'robert.johnson@example.com', position: 'UI/UX Designer' },
    { id: 4, name: 'Emily Davis', email: 'emily.davis@example.com', position: 'Project Manager' },
    { id: 5, name: 'Michael Wilson', email: 'michael.wilson@example.com', position: 'DevOps Engineer' },
  ];
};

const Evaluation = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [currentGroupId, setCurrentGroupId] = useState<number>(1);
  const [responses, setResponses] = useState<EvaluationResponse[]>([]);
  const [evaluatorId, setEvaluatorId] = useState<number | null>(null);
  const [approverId, setApproverId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  
  const handleGroupChange = useCallback((groupId: number) => {
    setCurrentGroupId(groupId);
  }, []);
  
  const handleResponseChange = useCallback((itemId: number, value: string | number) => {
    setResponses(prev => {
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
      
      toast.success("Auto-évaluation soumise", {
        description: "Votre évaluateur a été notifié"
      });
      
      setCurrentStep(2);
    } catch (error) {
      console.error("Erreur lors de la soumission de l'auto-évaluation:", error);
      toast.error("Échec de la soumission de l'auto-évaluation", {
        description: "Veuillez réessayer ultérieurement"
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [evaluatorId, approverId, responses]);
  
  const handleSubmitEvaluation = useCallback(async () => {
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Évaluation soumise", {
        description: "L'approbateur a été notifié"
      });
      
      setCurrentStep(3);
    } catch (error) {
      console.error("Erreur lors de la soumission de l'évaluation:", error);
      toast.error("Échec de la soumission de l'évaluation", {
        description: "Veuillez réessayer ultérieurement"
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [responses]);
  
  const handleApprove = useCallback(async (approved: boolean, comment?: string) => {
    if (!approved && (!comment || comment.trim().length < 10)) {
      toast.error("Commentaire requis", {
        description: "Veuillez fournir un commentaire détaillé pour le rejet"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (approved) {
        toast.success("Évaluation approuvée", {
          description: "Le processus d'évaluation est maintenant terminé"
        });
      } else {
        toast.success("Évaluation renvoyée pour révision", {
          description: "L'évaluateur a été notifié"
        });
      }
      
    } catch (error) {
      console.error("Erreur lors de la finalisation de l'évaluation:", error);
      toast.error("Échec de la finalisation de l'évaluation", {
        description: "Veuillez réessayer ultérieurement"
      });
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  useEffect(() => {
    if (criteriaGroups && criteriaGroups.length > 0) {
      setCurrentGroupId(criteriaGroups[0].id);
    }
  }, [currentStep, criteriaGroups]);
  
  return (
    <div className="flex flex-col min-h-screen w-full bg-[#f8f9fc]">
      <HRISNavbar />
      
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
                  <>
                    <EvaluationStepOne 
                      criteriaItems={criteriaItems || []}
                      onResponseChange={handleResponseChange}
                      responses={responses}
                      employees={employees || []}
                      onEvaluatorChange={setEvaluatorId}
                      onApproverChange={setApproverId}
                      isLoading={itemsLoading || isSubmitting}
                      onSubmit={handleSubmitSelfAssessment}
                    />
                    
                    {criteriaGroups && criteriaGroups.length > 0 && (
                      <div className="mt-8">
                        <Tabs 
                          value={currentGroupId.toString()}
                          onValueChange={(value) => handleGroupChange(parseInt(value))}
                        >
                          <TabsList className="w-full flex-wrap justify-start h-auto gap-2 bg-transparent p-0">
                            {criteriaGroups.map((group) => (
                              <TabsTrigger
                                key={group.id}
                                value={group.id.toString()}
                                className="data-[state=active]:bg-primary data-[state=active]:text-white"
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                {group.name}
                              </TabsTrigger>
                            ))}
                          </TabsList>
                        </Tabs>
                      </div>
                    )}
                  </>
                )}
                
                {currentStep === 2 && (
                  <EvaluationStepTwo 
                    criteriaItems={criteriaItems || []}
                    onResponseChange={handleResponseChange}
                    employeeResponses={responses}
                    isLoading={itemsLoading || isSubmitting}
                    onSubmit={handleSubmitEvaluation}
                  />
                )}
                
                {currentStep === 3 && (
                  <EvaluationStepThree 
                    criteriaItems={criteriaItems || []}
                    employeeResponses={responses}
                    evaluatorResponses={responses}
                    isLoading={itemsLoading || isSubmitting}
                    onApprove={handleApprove}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="instructions">
                <EvaluationInstructions currentStep={currentStep} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Evaluation;
