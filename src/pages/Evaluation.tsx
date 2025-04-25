import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/utils/apiClient';
import HRISNavbar from '@/components/hris/HRISNavbar';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from '@/components/ui/sidebar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, FileText, Star } from 'lucide-react';
import EvaluationHeader from '@/components/evaluations/EvaluationHeader';
import EvaluationStepOne from '@/components/evaluations/EvaluationStepOne';
import EvaluationStepTwo from '@/components/evaluations/EvaluationStepTwo';
import EvaluationStepThree from '@/components/evaluations/EvaluationStepThree';
import EvaluationInstructions from '@/components/evaluations/EvaluationInstructions';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
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
  
  const handleEmployeeResponseChange = useCallback((itemId: number, value: string | number) => {
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

  const handleEvaluatorResponseChange = useCallback((itemId: number, value: string | number) => {
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
  }, [evaluatorResponses]);
  
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
    <SidebarProvider>
      <div className="flex flex-col min-h-screen w-full bg-[#f8f9fc]">
        <HRISNavbar />
        
        <div className="flex flex-1 h-full overflow-hidden">
          <Sidebar>
            <SidebarHeader className="p-4 pb-0">
              <h3 className="text-lg font-medium mb-2">Évaluation</h3>
              <Progress value={calculateProgress()} className="h-2 mb-4" />
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                {criteriaGroups?.map((group) => (
                  <SidebarMenuItem key={group.id}>
                    <SidebarMenuButton 
                      isActive={currentGroupId === group.id}
                      onClick={() => handleGroupChange(group.id)}
                      tooltip={group.name}
                      className={`
                        ${currentGroupId === group.id 
                          ? 'bg-primary/10 text-primary font-semibold border-l-4 border-primary' 
                          : 'hover:bg-gray-100'}
                        transition-all duration-200 ease-in-out
                      `}
                    >
                      <FileText className="h-5 w-5" />
                      <span>{group.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>

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
                        isLoading={itemsLoading || isSubmitting}
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
                        isLoading={itemsLoading || isSubmitting}
                        onSubmit={handleSubmitEvaluation}
                      />
                    )}
                    
                    {currentStep === 3 && (
                      <EvaluationStepThree 
                        criteriaItems={criteriaItems || []}
                        employeeResponses={employeeResponses}
                        evaluatorResponses={evaluatorResponses}
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
