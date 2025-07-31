import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/utils/apiClient';
import { useSearchParams, useNavigate } from 'react-router-dom';
import HRISNavbar from '@/components/hris/HRISNavbar';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft } from 'lucide-react';
import EvaluationHeader from '@/components/evaluations/EvaluationHeader';
import EvaluationStepOne from '@/components/evaluations/EvaluationStepOne';
import EvaluationStepTwo from '@/components/evaluations/EvaluationStepTwo';
import EvaluationStepThree from '@/components/evaluations/EvaluationStepThree';
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
  const [employeeResponses, setEmployeeResponses] = useState<EvaluationResponse[]>([]);
  const [evaluatorResponses, setEvaluatorResponses] = useState<EvaluationResponse[]>([]);
  const [evaluatorId, setEvaluatorId] = useState<number | null>(null);
  const [approverId, setApproverId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMissionId, setSelectedMissionId] = useState<number | null>(null);

  useEffect(() => {
    if (stepParam) {
      const step = parseInt(stepParam);
      if (step >= 1 && step <= 3) {
        setCurrentStep(step as 1 | 2 | 3);
      }
    }
  }, [stepParam]);
  
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
      // Check basic fields (evaluator, approver, mission)
      let completedFields = 0;
      const totalRequiredFields = 3; // evaluator, approver, mission fields only for now
      
      if (evaluatorId) completedFields++;
      if (approverId) completedFields++;
      if (selectedMissionId) completedFields++;
      
      return Math.round((completedFields / totalRequiredFields) * 100);
    } else if (currentStep === 2) {
      // No criteria items for now, just return 100% for step 2
      return 100;
    }
    
    // Default: return 100% for step 3
    return 100;
  }, [
    currentStep, 
    evaluatorId, 
    approverId, 
    selectedMissionId
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
              variant="ghost"
              onClick={handleGoBack}
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour</span>
            </Button>
            <h1 className="text-2xl font-bold text-foreground">
              Évaluation de fin de saison - {typeof user?.grade === 'object' ? (user.grade as any)?.nom_grade : user?.grade}
            </h1>
          </div>
        </div>

        {/* Evaluation Header */}
        <EvaluationHeader currentStep={currentStep} />

        {/* Main Content Container */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {/* Progress Bar */}
          <div className="flex flex-col space-y-2 mb-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Progression</h3>
              <span className="text-sm text-gray-500">{calculateProgress()}%</span>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
          </div>

          {/* Step Content */}
          <div className="flex-1">
            {currentStep === 1 && (
              <div>
                
                <p className="text-muted-foreground mb-6">
                  Formulaire d'évaluation pour les postes de management. 
                  Les critères d'évaluation seront ajoutés prochainement.
                </p>
                
                {/* Basic selection form would go here */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Évaluateur</label>
                      <select 
                        value={evaluatorId || ''} 
                        onChange={(e) => setEvaluatorId(Number(e.target.value))}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">Sélectionner un évaluateur</option>
                        <option value="1">Évaluateur 1</option>
                        <option value="2">Évaluateur 2</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Approbateur</label>
                      <select 
                        value={approverId || ''} 
                        onChange={(e) => setApproverId(Number(e.target.value))}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">Sélectionner un approbateur</option>
                        <option value="1">Approbateur 1</option>
                        <option value="2">Approbateur 2</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Mission</label>
                      <select 
                        value={selectedMissionId || ''} 
                        onChange={(e) => setSelectedMissionId(Number(e.target.value))}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">Sélectionner une mission</option>
                        <option value="1">Mission 1</option>
                        <option value="2">Mission 2</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      onClick={handleSubmitSelfAssessment}
                      disabled={isSubmitting || !evaluatorId || !approverId || !selectedMissionId}
                      className="w-full md:w-auto"
                    >
                      {isSubmitting ? 'Soumission...' : 'Soumettre l\'auto-évaluation'}
                    </Button>
                  </div>
                </div>
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
        </div>
      </div>
    </div>
  );
};

export default ManagerEvaluation;