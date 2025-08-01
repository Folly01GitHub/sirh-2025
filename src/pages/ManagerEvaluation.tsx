import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/utils/apiClient';
import { useSearchParams, useNavigate } from 'react-router-dom';
import HRISNavbar from '@/components/hris/HRISNavbar';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import EvaluationHeader from '@/components/evaluations/EvaluationHeader';
import EvaluationStepOne from '@/components/evaluations/EvaluationStepOne';
import EvaluationStepTwo from '@/components/evaluations/EvaluationStepTwo';
import EvaluationStepThree from '@/components/evaluations/EvaluationStepThree';
import GroupTabTrigger from '@/components/evaluations/GroupTabTrigger';
import RepeaterField from '@/components/evaluations/RepeaterField';
import ClientFields from '@/components/evaluations/ClientFields';
import { toast } from 'sonner';
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
  group_name?: string;
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

// Mock data for manager evaluation groups
const fetchManagerCriteriaGroups = async (): Promise<CriteriaGroup[]> => {
  return [
    { id: 1, name: 'Synthèse clients à évaluer' },
    { id: 2, name: 'Récapitulatif feuille de temps' },
    { id: 3, name: 'Évaluation' },
  ];
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

const ManagerEvaluation = () => {
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAssociateId, setSelectedAssociateId] = useState<number | null>(null);
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
    queryKey: ['managerCriteriaGroups'],
    queryFn: fetchManagerCriteriaGroups
  });

  const {
    data: employees,
    isLoading: employeesLoading
  } = useQuery({
    queryKey: ['employees'],
    queryFn: fetchEmployees
  });
  
  // Helper function to validate a response based on criteria type
  const isValidResponse = useCallback((response: EvaluationResponse | undefined, type: string): boolean => {
    if (!response) return false;
    
    switch (type) {
      case 'numeric':
        if (response.value === "N/A") return true;
        const numericValue = typeof response.value === 'number' ? response.value : 
                          (typeof response.value === 'string' ? Number(response.value) : 0);
        return numericValue >= 1 && numericValue <= 5;
      case 'observation':
        return typeof response.value === 'string' && response.value.trim().length > 0;
      case 'commentaire':
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
      // Check basic fields (evaluator, associate)
      let completedFields = 0;
      const totalRequiredFields = 2; // evaluator, associate fields only
      
      if (evaluatorId) completedFields++;
      if (selectedAssociateId) completedFields++;
      
      return Math.round((completedFields / totalRequiredFields) * 100);
    } else if (currentStep === 2) {
      // No criteria items for now, just return 100% for step 2
      return 100;
    }
    
    // Default: show group-based progress for step 3
    if (!criteriaGroups || criteriaGroups.length === 0) return 0;
    
    const totalGroups = criteriaGroups.length;
    const currentGroupIndex = criteriaGroups.findIndex(group => group.id === currentGroupId);
    
    return Math.round(((currentGroupIndex + 1) / totalGroups) * 100);
  }, [
    currentStep, 
    evaluatorId, 
    selectedAssociateId,
    criteriaGroups,
    currentGroupId
  ]);
  
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
    if (!evaluatorId) {
      toast.error("Sélection incomplète", {
        description: "Veuillez sélectionner un évaluateur"
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
  }, [evaluatorId, employeeResponses]);
  
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

  const handleAssociateChange = useCallback((id: number) => {
    setSelectedAssociateId(id);
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
  
  // Helper function to truncate long titles for tab display
  const truncateGroupName = (name: string, maxLength = 20) => {
    if (name.length <= maxLength) return name;
    return `${name.substring(0, maxLength)}...`;
  };

  useEffect(() => {
    if (criteriaGroups && criteriaGroups.length > 0) {
      setCurrentGroupId(criteriaGroups[0].id);
    }
  }, [criteriaGroups]);

  const handleGoBack = () => {
    console.log('Navigating back to evaluation dashboard...');
    navigate('/evaluations');
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#f8f9fc]">
      <HRISNavbar />
      
      <div className="flex-1 flex flex-col p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="back"
              onClick={handleGoBack}
              className="mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux évaluations
            </Button>
          </div>
        </div>

        {/* Evaluation Header */}
        <EvaluationHeader 
          currentStep={currentStep} 
          title={`Évaluation de fin de saison - ${typeof user?.grade === 'object' ? (user.grade as any)?.nom_grade : user?.grade}`}
        />

        {/* Main Content Container */}
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
            
            {/* Sélecteurs principaux - Visible uniquement à l'étape 1 */}
            {currentStep === 1 && (
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Évaluateur</label>
                    <select 
                      value={evaluatorId || ''} 
                      onChange={(e) => setEvaluatorId(Number(e.target.value))}
                      className="w-full p-2 border rounded-md bg-white"
                    >
                      <option value="">Sélectionner un évaluateur</option>
                      <option value="1">Évaluateur 1</option>
                      <option value="2">Évaluateur 2</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Associé</label>
                    <select 
                      value={selectedAssociateId || ''} 
                      onChange={(e) => setSelectedAssociateId(Number(e.target.value))}
                      className="w-full p-2 border rounded-md bg-white"
                    >
                      <option value="">Sélectionner un associé</option>
                      <option value="1">John Doe</option>
                      <option value="2">Jane Smith</option>
                      <option value="3">Robert Johnson</option>
                      <option value="4">Emily Davis</option>
                      <option value="5">Michael Wilson</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            
            {/* Affichage des onglets de groupes */}
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
                        hasErrors={false} // Pas d'erreurs pour l'instant
                        truncatedName={group.name}
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

            {/* Step Content */}
            <div className="animate-fade-in">
            {currentStep === 1 && (
              <div>
                {currentGroupId === 1 && (
                  <div>                    
                    <RepeaterField
                      minInstances={7}
                      maxInstances={20}
                      template={<ClientFields />}
                    />
                  </div>
                )}
                
                {currentGroupId === 2 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Récapitulatif feuille de temps</h2>
                    <p className="text-muted-foreground mb-6">
                      Section dédiée au récapitulatif des feuilles de temps. Contenu à définir.
                    </p>
                  </div>
                )}
                
                {currentGroupId === 3 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Évaluation</h2>
                    <p className="text-muted-foreground mb-6">
                      Formulaire d'évaluation pour les postes de management. 
                      Les critères d'évaluation seront ajoutés prochainement.
                    </p>
                    
                    <div className="pt-4">
                      <Button 
                        onClick={handleSubmitSelfAssessment}
                        disabled={isSubmitting || !evaluatorId || !selectedAssociateId}
                        className="w-full md:w-auto"
                      >
                        {isSubmitting ? 'Soumission...' : 'Soumettre l\'auto-évaluation'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {currentStep === 2 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Évaluation par le manager</h2>
                <p className="text-muted-foreground mb-6">
                  Étape d'évaluation par le manager. Les critères seront ajoutés prochainement.
                </p>
                
                <Button 
                  onClick={handleSubmitEvaluation}
                  disabled={isSubmitting}
                  className="w-full md:w-auto"
                >
                  {isSubmitting ? 'Soumission...' : 'Soumettre l\'évaluation'}
                </Button>
              </div>
            )}
            
            {currentStep === 3 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Validation finale</h2>
                <p className="text-muted-foreground mb-6">
                  Étape de validation finale de l'évaluation manager.
                </p>
                
                <div className="flex gap-4">
                  <Button 
                    onClick={() => handleApprove(true)}
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Approuver
                  </Button>
                  <Button 
                    onClick={() => handleApprove(false, 'Commentaire de rejet')}
                    disabled={isSubmitting}
                    variant="destructive"
                  >
                    Rejeter
                  </Button>
                </div>
              </div>
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
  );
};

export default ManagerEvaluation;