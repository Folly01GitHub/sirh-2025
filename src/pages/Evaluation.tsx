import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/utils/apiClient';
import { useSearchParams } from 'react-router-dom';
import HRISNavbar from '@/components/hris/HRISNavbar';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, ChevronRight, FileText, Star, ArrowLeft } from 'lucide-react';
import EvaluationHeader from '@/components/evaluations/EvaluationHeader';
import EvaluationStepOne from '@/components/evaluations/EvaluationStepOne';
import EvaluationStepTwo from '@/components/evaluations/EvaluationStepTwo';
import EvaluationStepThree from '@/components/evaluations/EvaluationStepThree';
import GroupTabTrigger from '@/components/evaluations/GroupTabTrigger';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// Types for our evaluation data
export interface CriteriaGroup {
  id: number;
  name: string;
}

export interface CriteriaItem {
  id: number;
  type: 'numeric' | 'observation' | 'boolean' | 'commentaire';
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

const fetchCriteriaItemsForApprover = async (groupId: number): Promise<CriteriaItem[]> => {
  const response = await apiClient.get('/items_approbateur');
  return response.data.filter((item: CriteriaItem) => item.group_id === groupId);
};

const fetchAllCriteriaItems = async (): Promise<CriteriaItem[]> => {
  const response = await apiClient.get('/items');
  return response.data;
};

const fetchAllCriteriaItemsForApprover = async (): Promise<CriteriaItem[]> => {
  const response = await apiClient.get('/items_approbateur');
  return response.data;
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
  const [searchParams] = useSearchParams();
  const stepParam = searchParams.get('step');
  const initialStep = stepParam ? parseInt(stepParam) : 1;
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(initialStep as 1 | 2 | 3);
  const [currentGroupId, setCurrentGroupId] = useState<number>(1);
  const [employeeResponses, setEmployeeResponses] = useState<EvaluationResponse[]>([]);
  const [evaluatorResponses, setEvaluatorResponses] = useState<EvaluationResponse[]>([]);
  const [evaluatorId, setEvaluatorId] = useState<number | null>(null);
  const [approverId, setApproverId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMissionId, setSelectedMissionId] = useState<number | null>(null);
  const [showFullGroupName, setShowFullGroupName] = useState<number | null>(null);
  const [groupValidationState, setGroupValidationState] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (stepParam) {
      const step = parseInt(stepParam);
      if (step >= 1 && step <= 3) {
        setCurrentStep(step as 1 | 2 | 3);
      }
    }
  }, [stepParam]);
  
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
    enabled: !!currentGroupId && currentStep !== 3
  });
  
  const {
    data: criteriaItemsForApprover,
    isLoading: itemsForApproverLoading
  } = useQuery({
    queryKey: ['criteriaItemsForApprover', currentGroupId],
    queryFn: () => fetchCriteriaItemsForApprover(currentGroupId),
    enabled: !!currentGroupId && currentStep === 3
  });
  
  const {
    data: allCriteriaItems,
    isLoading: allItemsLoading
  } = useQuery({
    queryKey: ['allCriteriaItems'],
    queryFn: fetchAllCriteriaItems,
    enabled: currentStep !== 3
  });
  
  const {
    data: allCriteriaItemsForApprover,
    isLoading: allItemsForApproverLoading
  } = useQuery({
    queryKey: ['allCriteriaItemsForApprover'],
    queryFn: fetchAllCriteriaItemsForApprover,
    enabled: currentStep === 3
  });
  
  const {
    data: employees,
    isLoading: employeesLoading
  } = useQuery({
    queryKey: ['employees'],
    queryFn: fetchEmployees
  });
  
  // Helper function to get the correct items based on current step
  const getCurrentCriteriaItems = () => {
    if (currentStep === 3) {
      return criteriaItemsForApprover || [];
    }
    return criteriaItems || [];
  };
  
  const getCurrentAllCriteriaItems = () => {
    if (currentStep === 3) {
      return allCriteriaItemsForApprover || [];
    }
    return allCriteriaItems || [];
  };
  
  const getCurrentItemsLoading = () => {
    if (currentStep === 3) {
      return itemsForApproverLoading;
    }
    return itemsLoading;
  };
  
  // Helper function to validate a response based on criteria type
  const isValidResponse = useCallback((response: EvaluationResponse | undefined, type: string): boolean => {
    if (!response) return false;
    
    switch (type) {
      case 'numeric':
        // Accept "N/A" as a valid response for numeric items
        if (response.value === "N/A") return true;
        const numericValue = typeof response.value === 'number' ? response.value : 
                          (typeof response.value === 'string' ? Number(response.value) : 0);
        return numericValue >= 1 && numericValue <= 5;
      case 'observation':
        // Remove the 50-character minimum check, now just verify it's not empty
        return typeof response.value === 'string' && response.value.trim().length > 0;
      case 'commentaire':
        // Pour les commentaires, vérifier qu'ils ne sont pas vides
        return typeof response.value === 'string' && response.value.trim().length > 0;
      case 'boolean':
        return typeof response.value === 'string' && ['oui', 'non'].includes(response.value);
      default:
        return false;
    }
  }, []);
  
  // Calculate progress based on completed required fields
  const calculateProgress = useCallback(() => {
    if (currentStep === 1) {
      const currentAllItems = getCurrentAllCriteriaItems();
      if (!currentAllItems || currentAllItems.length === 0) return 0;
      
      // Inclure tous les items, y compris les commentaires (désormais obligatoires)
      const requiredItems = currentAllItems;
      
      // Check basic fields (evaluator, approver, mission)
      let completedFields = 0;
      const totalRequiredFields = requiredItems.length + 3; // +3 for evaluator, approver, mission fields
      
      if (evaluatorId) completedFields++;
      if (approverId) completedFields++;
      if (selectedMissionId) completedFields++;
      
      // Check criteria items (including 'commentaire' type)
      requiredItems.forEach(item => {
        const response = employeeResponses.find(r => r.item_id === item.id);
        if (isValidResponse(response, item.type)) {
          completedFields++;
        }
      });
      
      return Math.round((completedFields / totalRequiredFields) * 100);
    } else if (currentStep === 2) {
      const currentAllItems = getCurrentAllCriteriaItems();
      if (!currentAllItems || currentAllItems.length === 0) return 0;
      
      // Inclure tous les items, y compris les commentaires (désormais obligatoires)
      const requiredItems = currentAllItems;
      
      let completedFields = 0;
      const totalRequiredFields = requiredItems.length;
      
      // Check criteria items (including 'commentaire' type)
      requiredItems.forEach(item => {
        const response = evaluatorResponses.find(r => r.item_id === item.id);
        if (isValidResponse(response, item.type)) {
          completedFields++;
        }
      });
      
      return Math.round((completedFields / totalRequiredFields) * 100);
    }
    
    // Default: show group-based progress for step 3
    if (!criteriaGroups || criteriaGroups.length === 0) return 0;
    
    const totalGroups = criteriaGroups.length;
    const currentGroupIndex = criteriaGroups.findIndex(group => group.id === currentGroupId);
    
    return Math.round(((currentGroupIndex + 1) / totalGroups) * 100);
  }, [
    currentStep, 
    getCurrentAllCriteriaItems, 
    evaluatorId, 
    approverId, 
    selectedMissionId, 
    employeeResponses, 
    evaluatorResponses, 
    criteriaGroups, 
    currentGroupId, 
    isValidResponse
  ]);
  
  // Nouvelle fonction pour calculer les erreurs par groupe
  const calculateGroupErrors = useCallback(() => {
    const currentAllItems = getCurrentAllCriteriaItems();
    if (!currentAllItems || !criteriaGroups) return;

    const newGroupValidation: Record<number, boolean> = {};

    // Initialiser tous les groupes comme valides
    criteriaGroups.forEach(group => {
      newGroupValidation[group.id] = true;
    });

    // Vérifier les champs obligatoires par groupe
    // Inclure tous les items, y compris les commentaires (désormais obligatoires)
    currentAllItems.forEach(item => {
      const responses = currentStep === 1 ? employeeResponses : evaluatorResponses;
      const response = responses.find(r => r.item_id === item.id);
      
      // Si une réponse n'est pas valide, marquer ce groupe comme ayant des erreurs
      if (!isValidResponse(response, item.type)) {
        newGroupValidation[item.group_id] = false;
      }
    });
    
    // En étape 1, vérifier également si les champs de base (évaluateur, approbateur, mission) sont remplis
    if (currentStep === 1) {
      const hasBasicFieldsErrors = !evaluatorId || !approverId || !selectedMissionId;
      
      // Si il y a des erreurs dans les champs de base, mettre le premier groupe en erreur
      if (hasBasicFieldsErrors && criteriaGroups.length > 0) {
        newGroupValidation[criteriaGroups[0].id] = false;
      }
    }
    
    setGroupValidationState(newGroupValidation);
  }, [
    getCurrentAllCriteriaItems,
    criteriaGroups,
    currentStep,
    employeeResponses,
    evaluatorResponses,
    isValidResponse,
    evaluatorId,
    approverId,
    selectedMissionId
  ]);
  
  // Appeler calculateGroupErrors chaque fois que les données pertinentes changent
  useEffect(() => {
    calculateGroupErrors();
  }, [
    calculateGroupErrors,
    getCurrentAllCriteriaItems,
    employeeResponses,
    evaluatorResponses,
    evaluatorId,
    approverId,
    selectedMissionId,
    currentStep
  ]);
  
  const handleGroupChange = useCallback((groupId: string) => {
    setCurrentGroupId(parseInt(groupId));
    
    // Scroll to top when changing groups
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Afficher le nom complet du groupe pendant 3 secondes
    setShowFullGroupName(parseInt(groupId));
    setTimeout(() => {
      setShowFullGroupName(null);
    }, 3000);
  }, []);
  
  const handlePreviousGroup = useCallback(() => {
    if (criteriaGroups && criteriaGroups.length > 0) {
      const currentIndex = criteriaGroups.findIndex(group => group.id === currentGroupId);
      if (currentIndex > 0) {
        setCurrentGroupId(criteriaGroups[currentIndex - 1].id);
        
        // Scroll to top when navigating to previous group
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [criteriaGroups, currentGroupId]);
  
  const handleNextGroup = useCallback(() => {
    if (criteriaGroups && criteriaGroups.length > 0) {
      const currentIndex = criteriaGroups.findIndex(group => group.id === currentGroupId);
      if (currentIndex < criteriaGroups.length - 1) {
        setCurrentGroupId(criteriaGroups[currentIndex + 1].id);
        
        // Scroll to top when navigating to next group
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
  }, [criteriaGroups]);
  
  // Helper function to truncate long titles for tab display
  const truncateGroupName = (name: string, maxLength = 20) => {
    if (name.length <= maxLength) return name;
    return `${name.substring(0, maxLength)}...`;
  };
  
  const handleGoBack = () => {
    console.log('Navigating back to evaluation dashboard...');
    navigate('/evaluations');
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#f8f9fc]">
      <HRISNavbar />
      
      <div className="flex flex-col h-full w-full overflow-auto">
        <div className="container mx-auto p-4 md:p-6 lg:p-8 animate-fade-in">
          <Button
            variant="back"
            onClick={handleGoBack}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux évaluations
          </Button>

          <EvaluationHeader currentStep={currentStep} />
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col space-y-4">
              {/* Barre de progression - Cachée à l'étape 3 */}
              {currentStep !== 3 && (
                <div className="flex flex-col space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Progression</h3>
                    <span className="text-sm text-gray-500">{calculateProgress()}%</span>
                  </div>
                  <Progress value={calculateProgress()} className="h-2" />
                </div>
              )}
              
              {/* Affichage des onglets de groupes avec indicateurs d'erreur - Indicateurs désactivés à l'étape 3 */}
              {criteriaGroups && criteriaGroups.length > 0 ? (
                <div className="mb-4">
                  <ScrollArea className="w-full">
                    <div className="mb-4 flex-nowrap w-max">
                      {criteriaGroups.map((group) => (
                        <GroupTabTrigger
                          key={group.id}
                          value={String(group.id)}
                          title={group.name}
                          showFullName={showFullGroupName === group.id}
                          hasErrors={currentStep === 3 ? false : groupValidationState[group.id] === false}
                          truncatedName={truncateGroupName(group.name, 18)}
                          fullName={group.name}
                          onClick={() => handleGroupChange(String(group.id))}
                          active={currentGroupId === group.id}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  {groupsLoading ? "Chargement des groupes..." : "Aucun groupe disponible"}
                </div>
              )}
              
              {/* Removed the Tabs component and directly showing the content */}
              <div className="animate-fade-in">
                {currentStep === 1 && (
                  <EvaluationStepOne 
                    criteriaItems={getCurrentCriteriaItems()}
                    onResponseChange={handleEmployeeResponseChange}
                    responses={employeeResponses}
                    employees={employees || []}
                    onEvaluatorChange={setEvaluatorId}
                    onApproverChange={setApproverId}
                    isLoading={getCurrentItemsLoading() || isSubmitting}
                    onSubmit={handleSubmitSelfAssessment}
                    onMissionChange={handleMissionChange}
                    selectedMissionId={selectedMissionId}
                    selectedEvaluatorId={evaluatorId}
                    selectedApproverId={approverId}
                  />
                )}
                
                {currentStep === 2 && (
                  <EvaluationStepTwo 
                    criteriaItems={getCurrentCriteriaItems()}
                    onResponseChange={handleEvaluatorResponseChange}
                    employeeResponses={employeeResponses}
                    isLoading={getCurrentItemsLoading() || isSubmitting}
                    onSubmit={handleSubmitEvaluation}
                  />
                )}
                
                {currentStep === 3 && (
                  <EvaluationStepThree 
                    criteriaItems={getCurrentCriteriaItems()}
                    isLoading={getCurrentItemsLoading() || isSubmitting}
                    onApprove={handleApprove}
                    onPreviousGroup={handlePreviousGroup}
                    onNextGroup={handleNextGroup}
                    isFirstGroup={!criteriaGroups || criteriaGroups.findIndex(g => g.id === currentGroupId) === 0}
                    isLastGroup={!criteriaGroups || criteriaGroups.findIndex(g => g.id === currentGroupId) === (criteriaGroups.length - 1)}
                  />
                )}
              </div>
              
              {/* Boutons de navigation entre groupes - Masqués pour l'étape 3 */}
              {currentStep !== 3 && (
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Evaluation;
