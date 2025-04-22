import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
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
import axios from 'axios';

// Types for our evaluation data
export interface CriteriaGroup {
  id: number;
  name: string;
}

export interface CriteriaItem {
  id: number;
  type: 'numeric' | 'observation';
  label: string;
  group_id: number;
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

// --- New interface for Missions (Assignments) ---
export interface Assignment {
  id: number;
  titre: string;
}

const fetchCriteriaGroups = async (): Promise<CriteriaGroup[]> => {
  // This would be an API call in production
  return [
    { id: 1, name: 'Technical Skills' },
    { id: 2, name: 'Soft Skills' },
    { id: 3, name: 'Productivity' },
    { id: 4, name: 'Initiative' },
    { id: 5, name: 'Team Collaboration' },
    { id: 6, name: 'Problem Solving' },
  ];
};

const fetchCriteriaItems = async (groupId: number): Promise<CriteriaItem[]> => {
  // This would be an API call in production
  const items: Record<number, CriteriaItem[]> = {
    1: [
      { id: 1, type: 'numeric', label: 'Tools Mastery', group_id: 1 },
      { id: 2, type: 'observation', label: 'Technical Comments', group_id: 1 },
      { id: 3, type: 'numeric', label: 'Code Quality', group_id: 1 },
      { id: 4, type: 'numeric', label: 'Problem-Solving Skills', group_id: 1 },
    ],
    2: [
      { id: 5, type: 'numeric', label: 'Communication', group_id: 2 },
      { id: 6, type: 'observation', label: 'Communication Comments', group_id: 2 },
      { id: 7, type: 'numeric', label: 'Teamwork', group_id: 2 },
    ],
    3: [
      { id: 8, type: 'numeric', label: 'Efficiency', group_id: 3 },
      { id: 9, type: 'observation', label: 'Productivity Comments', group_id: 3 },
      { id: 10, type: 'numeric', label: 'Quality of Deliverables', group_id: 3 },
    ],
    4: [
      { id: 11, type: 'numeric', label: 'Proactivity', group_id: 4 },
      { id: 12, type: 'observation', label: 'Initiative Comments', group_id: 4 },
    ],
    5: [
      { id: 13, type: 'numeric', label: 'Collaboration', group_id: 5 },
      { id: 14, type: 'observation', label: 'Team Collaboration Comments', group_id: 5 },
    ],
    6: [
      { id: 15, type: 'numeric', label: 'Critical Thinking', group_id: 6 },
      { id: 16, type: 'observation', label: 'Problem Solving Comments', group_id: 6 },
    ],
  };
  
  return items[groupId] || [];
};

const fetchEmployees = async (): Promise<Employee[]> => {
  // This would be an API call in production
  return [
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', position: 'Frontend Developer' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', position: 'Backend Developer' },
    { id: 3, name: 'Robert Johnson', email: 'robert.johnson@example.com', position: 'UI/UX Designer' },
    { id: 4, name: 'Emily Davis', email: 'emily.davis@example.com', position: 'Project Manager' },
    { id: 5, name: 'Michael Wilson', email: 'michael.wilson@example.com', position: 'DevOps Engineer' },
  ];
};

// --- Fetch missions (assignments) ---
const fetchMissions = async (): Promise<Assignment[]> => {
  const response = await axios.get('http://backend.local.com/api/liste_missions');
  // Adapt shape if necessary; assuming data is Array<{ id, titre }>
  return response.data;
};

const Evaluation = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [currentGroupId, setCurrentGroupId] = useState<number>(1);
  const [responses, setResponses] = useState<EvaluationResponse[]>([]);
  const [evaluatorId, setEvaluatorId] = useState<number | null>(null);
  const [approverId, setApproverId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- NEW: State for assignments ---
  const [selectedAssignment, setSelectedAssignment] = useState<number | null>(null);

  // Fetch criteria groups
  const { 
    data: criteriaGroups, 
    isLoading: groupsLoading 
  } = useQuery({
    queryKey: ['criteriaGroups'],
    queryFn: fetchCriteriaGroups
  });

  // Fetch criteria items for the current group
  const {
    data: criteriaItems,
    isLoading: itemsLoading
  } = useQuery({
    queryKey: ['criteriaItems', currentGroupId],
    queryFn: () => fetchCriteriaItems(currentGroupId),
    enabled: !!currentGroupId
  });

  // Fetch employees for selection
  const {
    data: employees,
    isLoading: employeesLoading
  } = useQuery({
    queryKey: ['employees'],
    queryFn: fetchEmployees
  });

  // --- Fetch assignments (missions) ---
  const {
    data: missions,
    isLoading: missionsLoading
  } = useQuery({
    queryKey: ['assignments'],
    queryFn: fetchMissions
  });

  // Calculate progress percentage
  const calculateProgress = useCallback(() => {
    if (!criteriaGroups || criteriaGroups.length === 0) return 0;
    
    const totalGroups = criteriaGroups.length;
    const currentGroupIndex = criteriaGroups.findIndex(group => group.id === currentGroupId);
    
    return Math.round(((currentGroupIndex + 1) / totalGroups) * 100);
  }, [criteriaGroups, currentGroupId]);

  // Handle navigating to a specific group
  const handleGroupChange = useCallback((groupId: number) => {
    setCurrentGroupId(groupId);
  }, []);

  // Handle navigation between groups
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

  // Handle updating responses
  const handleResponseChange = useCallback((itemId: number, value: string | number) => {
    setResponses(prev => {
      // Check if response already exists
      const existingIndex = prev.findIndex(response => response.item_id === itemId);
      
      if (existingIndex !== -1) {
        // Update existing response
        const updated = [...prev];
        updated[existingIndex] = { item_id: itemId, value };
        return updated;
      } else {
        // Add new response
        return [...prev, { item_id: itemId, value }];
      }
    });
  }, []);

  // Handle submission of self-assessment
  const handleSubmitSelfAssessment = useCallback(async () => {
    if (!selectedAssignment) {
      toast.error("Veuillez sélectionner la mission concernée");
      return;
    }
    if (!evaluatorId || !approverId) {
      toast.error("Veuillez sélectionner à la fois un évaluateur et un validateur");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // This would be an API call in production
      // const response = await axios.post('/api/save_auto_evaluation', {
      //   mission_id: 1, // Replace with actual mission ID
      //   evaluator_id: evaluatorId,
      //   approver_id: approverId,
      //   responses
      // });
      
      // Mock API response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Auto-évaluation soumise avec succès", {
        description: "Votre évaluateur a été notifié",
      });
      
      // Move to step 2 (in a real app, only the evaluator would see step 2)
      setCurrentStep(2);
    } catch (error) {
      console.error("Error submitting self-assessment:", error);
      toast.error("Échec de la soumission de l'auto-évaluation", {
        description: "Veuillez réessayer plus tard"
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedAssignment, evaluatorId, approverId, responses]);

  // Handle submission of evaluation by manager
  const handleSubmitEvaluation = useCallback(async () => {
    setIsSubmitting(true);
    
    try {
      // This would be an API call in production
      // const response = await axios.post('/api/save_evaluation', {
      //   evaluation_id: 1, // Replace with actual evaluation ID
      //   responses
      // });
      
      // Mock API response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Évaluation soumise avec succès", {
        description: "Le validateur a été notifié",
      });
      
      // Move to step 3 (in a real app, only the approver would see step 3)
      setCurrentStep(3);
    } catch (error) {
      console.error("Error submitting evaluation:", error);
      toast.error("Échec de la soumission de l'évaluation", {
        description: "Veuillez réessayer plus tard"
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [responses]);

  // Handle final approval
  const handleApprove = useCallback(async (approved: boolean, comment?: string) => {
    if (!approved && (!comment || comment.trim().length < 10)) {
      toast.error("Veuillez fournir un commentaire détaillé pour la réjection");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // This would be an API call in production
      // const response = await axios.post('/api/validate_evaluation', {
      //   evaluation_id: 1, // Replace with actual evaluation ID
      //   approved,
      //   comment
      // });
      
      // Mock API response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (approved) {
        toast.success("Évaluation approuvée", {
          description: "Le processus d'évaluation est maintenant terminé"
        });
      } else {
        toast.success("Évaluation renvoyée pour révision", {
          description: "L'évaluateur a été notifié"
        });
        // In a real app, we would go back to step 2 with the evaluator
      }
      
      // In a real app, we would redirect to a summary page or dashboard
    } catch (error) {
      console.error("Error finalizing evaluation:", error);
      toast.error("Échec de la finalisation de l'évaluation", {
        description: "Veuillez réessayer plus tard"
      });
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // Reset to first group when step changes
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
              <h3 className="text-lg font-medium mb-2">Évaluation de mission</h3>
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
              {/* Header with step indicator */}
              <EvaluationHeader currentStep={currentStep} />
              
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                {/* Different content based on the current step */}
                <Tabs defaultValue="content" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="content">Évaluation</TabsTrigger>
                    <TabsTrigger value="instructions">Instructions</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="content" className="animate-fade-in">
                    {currentStep === 1 && (
                      <EvaluationStepOne 
                        criteriaItems={criteriaItems || []}
                        onResponseChange={handleResponseChange}
                        responses={responses}
                        employees={employees || []}
                        onEvaluatorChange={setEvaluatorId}
                        onApproverChange={setApproverId}
                        isLoading={itemsLoading || isSubmitting}
                        onSubmit={handleSubmitSelfAssessment}
                        assignments={missions || []}
                        selectedAssignment={selectedAssignment}
                        onAssignmentChange={setSelectedAssignment}
                        assignmentsLoading={missionsLoading}
                      />
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
                        evaluatorResponses={responses} // In a real app, these would be different
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
              
              {/* Group navigation buttons */}
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
