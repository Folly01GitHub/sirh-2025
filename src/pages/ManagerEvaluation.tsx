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
import ClientEditableTable from '@/components/evaluations/ClientEditableTable';
import ActiviteFields from '@/components/evaluations/ActiviteFields';
import ActiviteEditableTable from '@/components/evaluations/ActiviteEditableTable';
import EvaluationItems from '@/components/evaluations/EvaluationItems';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
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

export interface Evaluator {
  id: number;
  name: string;
  position: string;
}

export interface Associate {
  id: number;
  name: string;
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
  const evaluationIdParam = searchParams.get('id');
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
  
  // Group form data (no localStorage persistence - only for group switching)
  const [clientInstances, setClientInstances] = useState<any[]>(
    Array(7).fill(null).map((_, index) => ({ id: index + 1 }))
  );
  const [activiteInstances, setActiviteInstances] = useState<any[]>(
    Array(5).fill(null).map((_, index) => ({ id: index + 1 }))
  );
  const [clientFormData, setClientFormData] = useState<Record<number, any>>({});
  
  // Initialize with one empty row for the table
  useEffect(() => {
    if (Object.keys(clientFormData).length === 0) {
      setClientFormData({ 1: {} });
    }
  }, [clientFormData]);
  const [activiteFormData, setActiviteFormData] = useState<Record<number, any>>({});
  
  // Initialize activite table with one empty row
  useEffect(() => {
    if (Object.keys(activiteFormData).length === 0) {
      setActiviteFormData({ 1: {} });
    }
  }, [activiteFormData]);
  const [evaluationFormData, setEvaluationFormData] = useState<Record<number, string>>({});
  const [evaluators, setEvaluators] = useState<Evaluator[]>([]);
  const [evaluatorsLoading, setEvaluatorsLoading] = useState(false);
  const [associates, setAssociates] = useState<Associate[]>([]);
  const [associatesLoading, setAssociatesLoading] = useState(false);
  
  // Step 2 - Manager responses data
  const [managerResponses, setManagerResponses] = useState<any>(null);
  const [managerResponsesLoading, setManagerResponsesLoading] = useState(false);
  
  // Step 3 - All evaluation notes data
  const [evaluationNotes, setEvaluationNotes] = useState<any>(null);
  const [evaluationNotesLoading, setEvaluationNotesLoading] = useState(false);
  const [associateFormData, setAssociateFormData] = useState<Record<number, string>>({});
  
  // Fetch evaluation items for displaying proper titles
  const [evaluationItems, setEvaluationItems] = useState<any[]>([]);
  const [evaluationItemsLoading, setEvaluationItemsLoading] = useState(false);

  // Fetch evaluation items from API
  const fetchEvaluationItems = useCallback(async () => {
    setEvaluationItemsLoading(true);
    try {
      const response = await apiClient.get('/item-manager');
      setEvaluationItems(response.data.data || []);
    } catch (error) {
      console.error('Error fetching evaluation items:', error);
    } finally {
      setEvaluationItemsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentStep === 2 || currentStep === 3) {
      fetchEvaluationItems();
    }
  }, [currentStep, fetchEvaluationItems]);

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

  // Fetch evaluators from API
  const fetchEvaluators = useCallback(async (search?: string) => {
    setEvaluatorsLoading(true);
    try {
      const response = await apiClient.get('/evaluateurs-manager', {
        params: search ? { search } : {}
      });
      const evaluatorsData = response.data.map((evaluator: any) => ({
        id: evaluator.id,
        name: evaluator.name,
        position: evaluator.position
      }));
      setEvaluators(evaluatorsData);
    } catch (error) {
      console.error('Error fetching evaluators:', error);
      toast.error('Erreur lors du chargement des évaluateurs');
    } finally {
      setEvaluatorsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvaluators();
  }, [fetchEvaluators]);

  // Fetch associates from API
  const fetchAssociates = useCallback(async (search?: string) => {
    setAssociatesLoading(true);
    try {
      const response = await apiClient.get('/associe_list', {
        params: search ? { search } : {}
      });
      const associatesData = response.data.map((associate: any) => ({
        id: associate.id,
        name: associate.name,
        position: associate.position
      }));
      setAssociates(associatesData);
    } catch (error) {
      console.error('Error fetching associates:', error);
      toast.error('Erreur lors du chargement des associés');
    } finally {
      setAssociatesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssociates();
  }, [fetchAssociates]);

  // Fetch manager responses for step 2
  const fetchManagerResponses = useCallback(async () => {
    const evaluationId = evaluationIdParam || evaluatorId;
    if (!evaluationId) return;
    
    setManagerResponsesLoading(true);
    try {
      const response = await apiClient.get(`/evaluations/${evaluationId}/manager-reponses`);
      setManagerResponses(response.data);
    } catch (error) {
      console.error('Error fetching manager responses:', error);
      toast.error('Erreur lors du chargement des réponses du manager');
    } finally {
      setManagerResponsesLoading(false);
    }
  }, [evaluationIdParam, evaluatorId]);

  useEffect(() => {
    if (currentStep === 2) {
      fetchManagerResponses();
    }
  }, [currentStep, fetchManagerResponses]);

  // Fetch evaluation notes for step 3
  const fetchEvaluationNotes = useCallback(async () => {
    const evaluationId = evaluationIdParam || evaluatorId;
    if (!evaluationId) return;
    
    setEvaluationNotesLoading(true);
    try {
      const response = await apiClient.get(`/evaluations/${evaluationId}/notes`);
      setEvaluationNotes(response.data);
    } catch (error) {
      console.error('Error fetching evaluation notes:', error);
      toast.error('Erreur lors du chargement des notes d\'évaluation');
    } finally {
      setEvaluationNotesLoading(false);
    }
  }, [evaluationIdParam, evaluatorId]);

  useEffect(() => {
    if (currentStep === 3) {
      fetchEvaluationNotes();
    }
  }, [currentStep, fetchEvaluationNotes]);

  // Handlers for form data updates (no localStorage - only in-memory)
  const handleClientFormDataChange = useCallback((instanceIndex: number, field: string, value: string) => {
    setClientFormData(prev => ({
      ...prev,
      [instanceIndex]: {
        ...prev[instanceIndex],
        [field]: value
      }
    }));
  }, []);

  const handleAddClientRow = useCallback(() => {
    const newIndex = Math.max(...Object.keys(clientFormData).map(Number), 0) + 1;
    setClientFormData(prev => ({
      ...prev,
      [newIndex]: {}
    }));
  }, [clientFormData]);

  const handleDeleteClientRow = useCallback((rowIndex: number) => {
    setClientFormData(prev => {
      const newData = { ...prev };
      delete newData[rowIndex];
      return newData;
    });
  }, []);

  const handleActiviteFormDataChange = useCallback((instanceIndex: number, field: string, value: string) => {
    setActiviteFormData(prev => ({
      ...prev,
      [instanceIndex]: {
        ...prev[instanceIndex],
        [field]: value
      }
    }));
  }, []);

  const handleAddActiviteRow = useCallback(() => {
    const newIndex = Math.max(...Object.keys(activiteFormData).map(Number), 0) + 1;
    setActiviteFormData(prev => ({
      ...prev,
      [newIndex]: {}
    }));
  }, [activiteFormData]);

  const handleDeleteActiviteRow = useCallback((rowIndex: number) => {
    setActiviteFormData(prev => {
      const newData = { ...prev };
      delete newData[rowIndex];
      return newData;
    });
  }, []);

  const handleEvaluationFormDataChange = useCallback((itemId: number, value: string) => {
    setEvaluationFormData(prev => ({
      ...prev,
      [itemId]: value
    }));
  }, []);

  const handleAssociateFormDataChange = useCallback((itemId: number, value: string) => {
    setAssociateFormData(prev => ({
      ...prev,
      [itemId]: value
    }));
  }, []);
  
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
    // Validation des champs de base
    if (!evaluatorId) {
      toast.error("Sélection incomplète", {
        description: "Veuillez sélectionner un évaluateur"
      });
      return;
    }

    if (!selectedAssociateId) {
      toast.error("Sélection incomplète", {
        description: "Veuillez sélectionner un associé"
      });
      return;
    }

    // Validation du groupe "Synthèse clients à évaluer" (groupId: 1)
    const hasValidClient = Object.values(clientFormData).some((client: any) => {
      return client && 
             client.mission && client.mission.trim() !== '' &&
             client.client && client.client.trim() !== '' &&
             client.dateDebutIntervention && client.dateDebutIntervention.trim() !== '' &&
             client.dateFinIntervention && client.dateFinIntervention.trim() !== '' &&
             client.etatAvancement && client.etatAvancement.trim() !== '' &&
             client.tempsCollaborateur && client.tempsCollaborateur.trim() !== '' &&
             client.tempsEquipe && client.tempsEquipe.trim() !== '' &&
             client.honoraires && client.honoraires.trim() !== '' &&
             client.bonisMalis && client.bonisMalis.trim() !== '';
    });

    if (!hasValidClient) {
      toast.error("Groupe Synthèse clients à évaluer incomplet", {
        description: "Au moins un client doit être renseigné avec toutes ses informations obligatoires"
      });
      return;
    }

    // Validation du groupe "Récapitulatif feuille de temps" (groupId: 2)
    const hasValidActivite = Object.values(activiteFormData).some((activite: any) => {
      return activite && 
             activite.libelleActivite && activite.libelleActivite.trim() !== '' &&
             activite.nombreHeuresPassees && parseFloat(activite.nombreHeuresPassees) > 0;
    });

    if (!hasValidActivite) {
      toast.error("Groupe Récapitulatif feuille de temps incomplet", {
        description: "Au moins une activité doit être renseignée avec toutes ses informations obligatoires"
      });
      return;
    }

    // Validation du groupe "Évaluation" (groupId: 3) - Tous les champs obligatoires
    const evaluationFields = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // IDs des champs d'évaluation
    const missingEvaluationFields = evaluationFields.filter(fieldId => {
      const value = evaluationFormData[fieldId];
      return !value || value.trim() === '';
    });

    if (missingEvaluationFields.length > 0) {
      toast.error("Groupe Évaluation incomplet", {
        description: "Tous les champs du groupe Évaluation sont obligatoires"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Préparer les données pour l'API
      const responses: any[] = [];
      
      // Données des clients
      Object.entries(clientFormData).forEach(([instanceIndex, client]: [string, any]) => {
        if (client) {
          Object.entries(client).forEach(([field, value]) => {
            if (value && typeof value === 'string' && value.trim() !== '') {
              responses.push({
                item_id: `client_${instanceIndex}_${field}`,
                value: value
              });
            }
          });
        }
      });
      
      // Données des activités
      Object.entries(activiteFormData).forEach(([instanceIndex, activite]: [string, any]) => {
        if (activite) {
          Object.entries(activite).forEach(([field, value]) => {
            if (value && typeof value === 'string' && value.trim() !== '') {
              responses.push({
                item_id: `activite_${instanceIndex}_${field}`,
                value: value
              });
            }
          });
        }
      });
      
      // Préparer les notes d'évaluation (items 1-11)
      const notes: any[] = [];
      Object.entries(evaluationFormData).forEach(([itemId, value]) => {
        const id = parseInt(itemId);
        if (id >= 1 && id <= 11 && value && value.trim() !== '') {
          notes.push({
            item_id: id,
            value: value
          });
        }
      });
      
      // Structure globale avec toutes les données
      const submissionData = {
        evaluator_id: evaluatorId,
        approver_id: selectedAssociateId,
        responses: responses,  // Tables clients + activités
        notes: notes          // Notes d'évaluation
      };
      
      await apiClient.post(`/evaluations/${evaluationIdParam}/notes/evaluateur`, submissionData);
      
      toast.success("Auto-évaluation soumise", {
        description: "Votre auto-évaluation a été soumise avec succès"
      });
      
      // Rediriger vers le dashboard des évaluations
      navigate('/evaluations');
    } catch (error) {
      console.error("Erreur lors de la soumission de l'auto-évaluation:", error);
      toast.error("Échec de la soumission de l'auto-évaluation", {
        description: "Veuillez réessayer ultérieurement"
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [evaluatorId, selectedAssociateId, clientFormData, activiteFormData, evaluationFormData]);
  
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
    // Validation : Vérifier que tous les champs d'évaluation sont remplis
    if (!evaluationItems || evaluationItems.length === 0) {
      toast.error("Erreur de validation", {
        description: "Les critères d'évaluation ne sont pas chargés"
      });
      return;
    }

    const missingFields = evaluationItems.filter(item => {
      const value = evaluationFormData[item.id];
      return !value || value.trim() === '';
    });

    if (missingFields.length > 0) {
      toast.error("Champs obligatoires manquants", {
        description: "Tous les champs d'évaluation doivent être remplis"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Préparer la structure spécifique pour l'API notes/evaluateur
      const notes: any[] = [];
      
      // Ajouter seulement les données d'évaluation (items 1-11)
      Object.entries(evaluationFormData).forEach(([itemId, value]) => {
        const id = parseInt(itemId);
        if (id >= 1 && id <= 11 && value && value.trim() !== '') {
          notes.push({
            item_id: id,
            value: value
          });
        }
      });
      
      const submissionData = {
        notes: notes
      };
      
      await apiClient.post(`/evaluations/${evaluationIdParam}/notes/evaluateur`, submissionData);
      
      toast.success("Évaluation soumise", {
        description: "L'évaluation a été soumise avec succès"
      });
      
      // Rediriger vers le dashboard des évaluations
      navigate('/evaluations');
    } catch (error) {
      console.error("Erreur lors de la soumission de l'évaluation:", error);
      toast.error("Échec de la soumission de l'évaluation", {
        description: "Veuillez réessayer ultérieurement"
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [evaluationFormData, evaluationItems, evaluationIdParam, navigate]);
  
  const handleSubmitAssociateEvaluation = useCallback(async () => {
    // Validation : Vérifier que tous les champs de l'associé sont remplis
    if (!evaluationItems || evaluationItems.length === 0) {
      toast.error("Erreur de validation", {
        description: "Les critères d'évaluation ne sont pas chargés"
      });
      return;
    }

    const missingFields = evaluationItems.filter(item => {
      const value = associateFormData[item.id];
      return !value || value.trim() === '';
    });

    if (missingFields.length > 0) {
      toast.error("Champs obligatoires manquants", {
        description: "Tous les champs d'évaluation doivent être remplis"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Préparer la structure spécifique pour l'API notes/approbateur
      const notes: any[] = [];
      
      // Ajouter seulement les données d'évaluation de l'associé (items 1-11)
      Object.entries(associateFormData).forEach(([itemId, value]) => {
        const id = parseInt(itemId);
        if (id >= 1 && id <= 11 && value && value.trim() !== '') {
          notes.push({
            item_id: id,
            value: value
          });
        }
      });
      
      const submissionData = {
        notes: notes
      };
      
      await apiClient.post(`/evaluations/${evaluationIdParam}/notes/approbateur`, submissionData);
      
      toast.success("Évaluation soumise", {
        description: "Votre évaluation d'associé a été soumise avec succès"
      });
      
      // Rediriger vers le dashboard des évaluations
      navigate('/evaluations');
    } catch (error) {
      console.error("Erreur lors de la soumission de l'évaluation d'associé:", error);
      toast.error("Échec de la soumission de l'évaluation", {
        description: "Veuillez réessayer ultérieurement"
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [evaluatorId, selectedAssociateId, associateFormData, evaluationItems, navigate]);
  
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
            {/* Sélecteurs principaux - Visible uniquement à l'étape 1 */}
            {currentStep === 1 && (
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <SearchableSelect
                      label="Évaluateur"
                      placeholder="Sélectionner un évaluateur"
                      value={evaluatorId?.toString() || ''}
                      onChange={(value) => setEvaluatorId(Number(value))}
                      onSearch={fetchEvaluators}
                      options={evaluators.map(evaluator => ({
                        value: evaluator.id.toString(),
                        label: `${evaluator.name} - ${evaluator.position}`
                      }))}
                      loading={evaluatorsLoading}
                    />
                  </div>
                  
                  <div>
                    <SearchableSelect
                      label="Associé"
                      placeholder="Sélectionner un associé"
                      value={selectedAssociateId?.toString() || ''}
                      onChange={(value) => setSelectedAssociateId(Number(value))}
                      onSearch={fetchAssociates}
                      options={associates.map(associate => ({
                        value: associate.id.toString(),
                        label: `${associate.name} - ${associate.position}`
                      }))}
                      loading={associatesLoading}
                    />
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
                    <ClientEditableTable
                      data={clientFormData}
                      onDataChange={handleClientFormDataChange}
                      onAddRow={handleAddClientRow}
                      onDeleteRow={handleDeleteClientRow}
                    />
                  </div>
                )}
                
                {currentGroupId === 2 && (
                  <div>                    
                    <ActiviteEditableTable
                      data={activiteFormData}
                      onDataChange={handleActiviteFormDataChange}
                      onAddRow={handleAddActiviteRow}
                      onDeleteRow={handleDeleteActiviteRow}
                    />
                  </div>
                )}
                
                {currentGroupId === 3 && (
                  <EvaluationItems 
                    formData={evaluationFormData}
                    onFormDataChange={handleEvaluationFormDataChange}
                  />
                )}
                
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
            
            {currentStep === 2 && (
              <div>
                <p className="text-muted-foreground mb-6">
                  Consultez les réponses du collaborateur et complétez votre évaluation.
                </p>
                
                {managerResponsesLoading ? (
                  <div className="text-center py-8">
                    <div className="text-muted-foreground">Chargement des réponses du manager...</div>
                  </div>
                ) : managerResponses ? (
                  <div className="space-y-8">
                    {/* Groupe 1: Synthèse clients à évaluer */}
                    {currentGroupId === 1 && (
                      <div>
                        <RepeaterField
                          minInstances={managerResponses.clients?.length || 1}
                          maxInstances={managerResponses.clients?.length || 1}
                          template={<ClientFields readonly={true} onFormDataChange={() => {}} formData={{}} />}
                          instances={managerResponses.clients?.map((client: any, index: number) => ({ 
                            id: index + 1,
                            ...client 
                          })) || []}
                          onInstancesChange={() => {}}
                          formData={managerResponses.clients?.reduce((acc: any, client: any, index: number) => {
                            acc[index] = {
                              client: client.nom_client,
                              dateDebutIntervention: client.date_debut_intervention,
                              dateFinIntervention: client.date_fin_intervention,
                              etatAvancement: client.etat_avancement,
                              tempsCollaborateur: client.temps_collaborateur?.toString(),
                              tempsEquipe: client.temps_equipe?.toString(),
                              honoraires: client.honoraires,
                              bonisMalis: client.bonis_malis
                            };
                            return acc;
                          }, {}) || {}}
                          onFormDataChange={() => {}}
                        />
                      </div>
                    )}
                    
                    {/* Groupe 2: Récapitulatif feuille de temps */}
                    {currentGroupId === 2 && (
                      <div>
                        <RepeaterField 
                          minInstances={managerResponses.activites?.length || 1}
                          maxInstances={managerResponses.activites?.length || 1}
                          template={<ActiviteFields readonly={true} onFormDataChange={() => {}} formData={{}} />}
                          instances={managerResponses.activites?.map((activite: any, index: number) => ({ 
                            id: index + 1,
                            ...activite 
                          })) || []}
                          onInstancesChange={() => {}}
                          itemLabel="Activité"
                           formData={managerResponses.activites?.reduce((acc: any, activite: any, index: number) => {
                             acc[index] = {
                               libelleActivite: activite.libelle,
                               nombreHeuresPassees: activite.nombre_heures?.toString(),
                               commentairesEventuels: activite.commentaire
                             };
                             return acc;
                           }, {}) || {}}
                          onFormDataChange={() => {}}
                        />
                      </div>
                    )}
                    
                    {/* Groupe 3: Évaluation - Division en deux parties */}
                    {currentGroupId === 3 && (
                      <div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Partie gauche: Réponses du manager (grisées) */}
                          <div className="space-y-4">
                            <h4 className="text-md font-medium text-muted-foreground">Réponses du manager</h4>
                             <div className="space-y-4">
                               {managerResponses?.notes_collaborateur && managerResponses.notes_collaborateur.length > 0 ? (
                                 managerResponses.notes_collaborateur.map((note: any, index: number) => {
                                   const evaluationItem = evaluationItems.find(item => item.id === note.item_id);
                                   const itemTitle = evaluationItem ? evaluationItem.titre : `Question ${note.item_id}`;
                                   const itemDescription = evaluationItem ? evaluationItem.description : '';
                                   
                                   return (
                                     <div key={note.item_id} className="border rounded-lg bg-muted/50">
                                       <div className="p-4 border-b bg-muted/20">
                                         <h3 className="text-base font-medium">{itemTitle}</h3>
                                         {itemDescription && (
                                           <p className="text-sm text-muted-foreground mt-1">{itemDescription}</p>
                                         )}
                                       </div>
                                       <div className="p-4">
                                         <div className="min-h-[100px] p-3 bg-background border rounded-md text-sm text-foreground opacity-75">
                                           {note.reponse_collaborateur}
                                         </div>
                                       </div>
                                     </div>
                                   );
                                 })
                               ) : (
                                 <div className="text-center py-8 text-muted-foreground">
                                   {managerResponsesLoading ? 'Chargement...' : 'Aucune réponse du manager disponible'}
                                 </div>
                               )}
                             </div>
                          </div>
                          
                          {/* Partie droite: Formulaire de l'évaluateur */}
                          <div className="space-y-4">
                            <h4 className="text-md font-medium">Vos réponses d'évaluateur</h4>
                            <EvaluationItems 
                              formData={evaluationFormData}
                              onFormDataChange={handleEvaluationFormDataChange}
                              hideTitle={true}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucune réponse du manager trouvée
                  </div>
                )}
                
                <div className="pt-6">
                  <Button 
                    onClick={handleSubmitEvaluation}
                    disabled={isSubmitting || !managerResponses}
                    className="w-full md:w-auto"
                  >
                    {isSubmitting ? 'Soumission...' : 'Soumettre l\'évaluation'}
                  </Button>
                </div>
              </div>
            )}
            
            {currentStep === 3 && (
              <div>
                <p className="text-muted-foreground mb-6">
                  Consultez les réponses du manager et de l'évaluateur, puis complétez vos propres réponses.
                </p>
                
                {evaluationNotesLoading ? (
                  <div className="text-center py-8">
                    <div className="text-muted-foreground">Chargement des notes d'évaluation...</div>
                  </div>
                ) : evaluationNotes ? (
                  <div className="space-y-8">
                    {/* Groupe 1: Synthèse clients à évaluer */}
                    {currentGroupId === 1 && (
                      <div>
                        <RepeaterField
                          minInstances={evaluationNotes.clients?.length || 1}
                          maxInstances={evaluationNotes.clients?.length || 1}
                          template={<ClientFields readonly={true} onFormDataChange={() => {}} formData={{}} />}
                          instances={evaluationNotes.clients?.map((client: any, index: number) => ({ 
                            id: index + 1,
                            ...client 
                          })) || []}
                          onInstancesChange={() => {}}
                          formData={evaluationNotes.clients?.reduce((acc: any, client: any, index: number) => {
                            acc[index] = {
                              client: client.nom_client,
                              dateDebutIntervention: client.date_debut_intervention,
                              dateFinIntervention: client.date_fin_intervention,
                              etatAvancement: client.etat_avancement,
                              tempsCollaborateur: client.temps_collaborateur?.toString(),
                              tempsEquipe: client.temps_equipe?.toString(),
                              honoraires: client.honoraires,
                              bonisMalis: client.bonis_malis
                            };
                            return acc;
                          }, {}) || {}}
                          onFormDataChange={() => {}}
                        />
                      </div>
                    )}
                    
                    {/* Groupe 2: Récapitulatif feuille de temps */}
                    {currentGroupId === 2 && (
                      <div>
                        <RepeaterField 
                          minInstances={evaluationNotes.activites?.length || 1}
                          maxInstances={evaluationNotes.activites?.length || 1}
                          template={<ActiviteFields readonly={true} onFormDataChange={() => {}} formData={{}} />}
                          instances={evaluationNotes.activites?.map((activite: any, index: number) => ({ 
                            id: index + 1,
                            ...activite 
                          })) || []}
                          onInstancesChange={() => {}}
                          itemLabel="Activité"
                           formData={evaluationNotes.activites?.reduce((acc: any, activite: any, index: number) => {
                             acc[index] = {
                               libelleActivite: activite.libelle,
                               nombreHeuresPassees: activite.nombre_heures?.toString(),
                               commentairesEventuels: activite.commentaire
                             };
                             return acc;
                           }, {}) || {}}
                          onFormDataChange={() => {}}
                        />
                      </div>
                    )}
                    
                    {/* Groupe 3: Évaluation - Division en trois parties */}
                    {currentGroupId === 3 && (
                      <div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                          {/* Partie gauche: Réponses du manager (grisées) */}
                          <div className="space-y-4">
                            <h4 className="text-md font-medium text-muted-foreground">Réponses du manager à évaluer</h4>
                            <div className="space-y-4">
                              {evaluationNotes.notes_collaborateur?.map((note: any) => {
                                const evaluationItem = evaluationItems.find(item => item.id === note.item_id);
                                const itemTitle = evaluationItem ? evaluationItem.titre : `Question ${note.item_id}`;
                                const itemDescription = evaluationItem ? evaluationItem.description : '';
                                
                                return (
                                  <div key={note.item_id} className="border rounded-lg bg-muted/50">
                                    <div className="p-4 border-b bg-muted/20">
                                      <h5 className="text-sm font-medium">{itemTitle}</h5>
                                      {itemDescription && (
                                        <p className="text-xs text-muted-foreground mt-1">{itemDescription}</p>
                                      )}
                                    </div>
                                    <div className="p-4">
                                      <div className="min-h-[80px] p-3 bg-background border rounded-md text-sm text-foreground opacity-75">
                                        {note.reponse}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          
                          {/* Partie droite: Réponses de l'évaluateur (grisées) */}
                          <div className="space-y-4">
                            <h4 className="text-md font-medium text-muted-foreground">Réponses de l'évaluateur</h4>
                            <div className="space-y-4">
                              {evaluationNotes.notes_evaluateur?.map((note: any) => {
                                const evaluationItem = evaluationItems.find(item => item.id === note.item_id);
                                const itemTitle = evaluationItem ? evaluationItem.titre : `Question ${note.item_id}`;
                                const itemDescription = evaluationItem ? evaluationItem.description : '';
                                
                                return (
                                  <div key={note.item_id} className="border rounded-lg bg-muted/50">
                                    <div className="p-4 border-b bg-muted/20">
                                      <h5 className="text-sm font-medium">{itemTitle}</h5>
                                      {itemDescription && (
                                        <p className="text-xs text-muted-foreground mt-1">{itemDescription}</p>
                                      )}
                                    </div>
                                    <div className="p-4">
                                      <div className="min-h-[80px] p-3 bg-background border rounded-md text-sm text-foreground opacity-75">
                                        {note.reponse}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        
                        {/* Partie bas: Formulaire pour l'associé */}
                        <div className="space-y-4">
                          <h4 className="text-md font-medium">Vos réponses d'associé</h4>
                          <EvaluationItems 
                            formData={associateFormData}
                            onFormDataChange={handleAssociateFormDataChange}
                            hideTitle={true}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucune note d'évaluation trouvée
                  </div>
                )}
                
                {/* Bouton de soumission uniquement pour le groupe 3 */}
                {currentGroupId === 3 && evaluationNotes && (
                  <div className="pt-6">
                    <Button 
                      onClick={handleSubmitAssociateEvaluation}
                      disabled={isSubmitting || !evaluationNotes}
                      className="w-full md:w-auto"
                    >
                      {isSubmitting ? 'Soumission...' : 'Soumettre l\'évaluation'}
                    </Button>
                  </div>
                )}
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