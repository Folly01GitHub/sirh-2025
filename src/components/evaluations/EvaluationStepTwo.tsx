
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CriteriaItem, EvaluationResponse, CriteriaGroup } from '@/pages/Evaluation';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, AlertTriangle, Save, Loader } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/utils/apiClient';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import NumericBoxGroup from './NumericBoxGroup';

interface EvaluationStepTwoProps {
  criteriaItems: CriteriaItem[];
  onResponseChange: (itemId: number, value: string) => void;
  employeeResponses: EvaluationResponse[];
  isLoading: boolean;
  onSubmit: () => void;
  evaluatorId?: number | null;
  approverId?: number | null;
  selectedMissionId?: number | null;
  employees?: Array<{ id: number; name: string; position: string; }>;
  evaluationInfo?: { collaborateur: string; evaluateur: string; mission: string; };
}

// Type pour la réponse API de l'évaluateur
interface EvaluatorAPIResponse {
  mission_id: string;
  evaluator_id: string;
  approver_id: string;
  responses: {
    id_item: string;
    reponse_item: string | null;
    type_item: string;
  }[];
}

const fetchAllCriteriaItems = async (): Promise<CriteriaItem[]> => {
  const response = await apiClient.get('/items');
  return response.data;
};

const refusalSchema = z.object({
  reason: z.string().min(10, "Le motif doit contenir au moins 10 caractères"),
});

type RefusalFormData = z.infer<typeof refusalSchema>;

const EvaluationStepTwo: React.FC<EvaluationStepTwoProps> = ({
  criteriaItems,
  onResponseChange,
  employeeResponses,
  isLoading,
  onSubmit,
  evaluatorId,
  approverId,
  selectedMissionId,
  employees = [],
  evaluationInfo
}) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const evaluationId = searchParams.get('id');
  
  const [refusalDialogOpen, setRefusalDialogOpen] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationAttempted, setValidationAttempted] = useState(false);
  const [missingFields, setMissingFields] = useState<{ group?: string, label: string }[]>([]);
  
  const refusalForm = useForm<RefusalFormData>({
    resolver: zodResolver(refusalSchema),
    defaultValues: {
      reason: "",
    },
  });
  
  const { data: collaboratorResponses = [], isLoading: responsesLoading } = useQuery({
    queryKey: ['collaboratorResponses', evaluationId],
    queryFn: async () => {
      if (!evaluationId) return [];
      try {
        const response = await apiClient.get('/responses', {
          params: { evaluation_id: evaluationId }
        });
        console.log("Raw collaborator responses from API:", response.data);
        
        // Ensure we have an array and format the responses properly
        const rawResponses = Array.isArray(response.data) ? response.data : [];
        const formattedResponses = rawResponses.map(resp => ({
          item_id: parseInt(resp.item_id || resp.id_item),
          value: resp.value || resp.reponse_item || ""
        }));
        
        console.log("Formatted collaborator responses:", formattedResponses);
        return formattedResponses;
      } catch (error) {
        console.error("Error fetching collaborator responses:", error);
        return [];
      }
    },
    enabled: !!evaluationId
  });
  
  const [evaluatorResponses, setEvaluatorResponses] = useState<EvaluationResponse[]>([]);
  const [criteriaMissing, setCriteriaMissing] = useState<boolean>(false);
  
  // Query pour récupérer les réponses de l'évaluateur (format API mise à jour)
  const { data: evaluatorApiResponse, isLoading: evaluatorResponsesLoading } = useQuery({
    queryKey: ['evaluatorPartialResponses', evaluationId],
    queryFn: async () => {
      if (!evaluationId) return null;
      try {
        const response = await apiClient.get('/evaluator_responses', {
          params: { evaluation_id: evaluationId }
        });
        console.log("Evaluator API response:", response.data);
        return response.data as EvaluatorAPIResponse;
      } catch (error) {
        console.error("Error fetching evaluator responses:", error);
        return null;
      }
    },
    enabled: !!evaluationId
  });
  
  const { data: allCriteriaItems, isSuccess: allItemsLoaded } = useQuery({
    queryKey: ['allCriteriaItems'],
    queryFn: fetchAllCriteriaItems
  });
  
  // Convertir le format API en format interne
  useEffect(() => {
    if (evaluatorApiResponse && evaluatorApiResponse.responses) {
      const formattedResponses = evaluatorApiResponse.responses
        .filter(response => response.id_item) // Assurons-nous que l'ID existe
        .map(response => ({
          item_id: parseInt(response.id_item),
          value: response.type_item === 'numeric' 
            ? (response.reponse_item === "N/A" ? "N/A" : (response.reponse_item ? parseFloat(response.reponse_item) : ''))
            : (response.reponse_item || '')
        }));
      
      setEvaluatorResponses(formattedResponses);
      
      // Notifier le composant parent de chaque réponse valide
      formattedResponses.forEach(response => {
        if (response.value !== '') {
          onResponseChange(response.item_id, response.value.toString());
        }
      });
      
      if (formattedResponses.length > 0) {
        toast.info("Brouillon chargé", {
          description: "Vos réponses précédentes ont été restaurées"
        });
      }
    }
  }, [evaluatorApiResponse, onResponseChange]);
  
  useEffect(() => {
    if (criteriaItems.length > 0) {
      setCriteriaMissing(false);
      setMissingFields([]);
    }
  }, [criteriaItems]);
  
  useEffect(() => {
    // Scroll to top when the component is mounted
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  const getCollaboratorResponseValue = (itemId: number) => {
    console.log(`Looking for collaborator response for item ${itemId}:`, collaboratorResponses);
    if (!collaboratorResponses || !collaboratorResponses.length) {
      console.log("No collaborator responses available");
      return "";
    }
    
    const response = collaboratorResponses.find(r => {
      const responseItemId = r.item_id; // Already parsed as number in query
      console.log(`Comparing ${responseItemId} with ${itemId}:`, responseItemId === itemId);
      return responseItemId === itemId;
    });
    
    const value = response ? response.value : "";
    console.log(`Found value for item ${itemId}:`, value);
    return value;
  };
  
  const getEvaluatorResponseValue = (itemId: number) => {
    const response = evaluatorResponses.find(r => r.item_id === itemId);
    return response ? response.value : "";
  };
  
  const handleEvaluatorResponseChange = (itemId: number, value: string | number) => {
    const stringValue = typeof value === 'number' ? value.toString() : value;
    
    setEvaluatorResponses(prev => {
      const existingIndex = prev.findIndex(r => r.item_id === itemId);
      
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = { item_id: itemId, value: stringValue };
        return updated;
      } else {
        return [...prev, { item_id: itemId, value: stringValue }];
      }
    });
    
    onResponseChange(itemId, stringValue);
    
    if (criteriaMissing) {
      setCriteriaMissing(false);
      setMissingFields([]);
    }
  };
  
  const renderCollaboratorStarRating = (itemId: number) => {
    const currentValue = Number(getCollaboratorResponseValue(itemId)) || 0;
    console.log(`Rendering collaborator star rating for item ${itemId} with value:`, currentValue);
    
    return (
      <div className="flex space-x-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <div key={value} className="flex flex-col items-center">
            <Star 
              className={`h-6 w-6 ${value <= currentValue ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
            />
          </div>
        ))}
      </div>
    );
  };
  
  const renderEvaluatorStarRating = (itemId: number) => {
    const currentValue = Number(getEvaluatorResponseValue(itemId)) || 0;
    
    return (
      <RadioGroup 
        value={currentValue.toString()} 
        onValueChange={(value) => handleEvaluatorResponseChange(itemId, parseInt(value))}
        className="flex space-x-2"
      >
        {[1, 2, 3, 4, 5].map((value) => (
          <div key={value} className="flex flex-col items-center">
            <RadioGroupItem 
              value={value.toString()} 
              id={`evaluator-rating-${itemId}-${value}`} 
              className="sr-only"
            />
            <label 
              htmlFor={`evaluator-rating-${itemId}-${value}`}
              className="cursor-pointer"
            >
              <Star 
                className={`h-6 w-6 transition-all ${value <= currentValue ? 'fill-primary text-primary' : 'text-gray-300'}`}
              />
            </label>
          </div>
        ))}
      </RadioGroup>
    );
  };
  
  const renderBooleanResponse = (itemId: number, isCollaborator: boolean = false) => {
    const value = isCollaborator ? 
      getCollaboratorResponseValue(itemId) : 
      getEvaluatorResponseValue(itemId);
    
    console.log(`Rendering boolean response for item ${itemId}, isCollaborator: ${isCollaborator}, value:`, value);
    
    if (isCollaborator) {
      return (
        <div className="flex gap-6">
          <div className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded-full border ${value === 'oui' ? 'bg-yellow-400 border-yellow-400' : 'border-gray-300'}`} />
            <span className="text-sm">Oui</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded-full border ${value === 'non' ? 'bg-yellow-400 border-yellow-400' : 'border-gray-300'}`} />
            <span className="text-sm">Non</span>
          </div>
        </div>
      );
    }

    return (
      <RadioGroup
        value={value ? value.toString() : ""}
        onValueChange={(val) => handleEvaluatorResponseChange(itemId, val)}
        className="flex gap-6"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="oui" id={`evaluator-oui-${itemId}`} />
          <label htmlFor={`evaluator-oui-${itemId}`} className="text-sm font-medium">
            Oui
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="non" id={`evaluator-non-${itemId}`} />
          <label htmlFor={`evaluator-non-${itemId}`} className="text-sm font-medium">
            Non
          </label>
        </div>
      </RadioGroup>
    );
  };
  
  const renderCollaboratorNumericBox = (itemId: number) => {
    const currentValue = getCollaboratorResponseValue(itemId);
    console.log(`Rendering collaborator numeric box for item ${itemId} with value:`, currentValue);
    // Preserve "N/A" value as-is, otherwise convert to number
    const displayValue = currentValue === "N/A" ? "N/A" : (currentValue ? Number(currentValue) : 0);
    return (
      <NumericBoxGroup value={displayValue} readOnly />
    );
  };
  
  const renderEvaluatorNumericBox = (itemId: number) => {
    const currentValue = getEvaluatorResponseValue(itemId);
    console.log(`Rendering evaluator numeric box for item ${itemId} with value:`, currentValue);
    // Preserve "N/A" value as-is, otherwise convert to number
    const displayValue = currentValue === "N/A" ? "N/A" : (currentValue ? Number(currentValue) : 0);
    return (
      <NumericBoxGroup
        value={displayValue}
        onChange={(val) => handleEvaluatorResponseChange(itemId, val)}
      />
    );
  };
  
  // Helper function to validate a response based on criteria type
  const isValidResponse = (response: EvaluationResponse | undefined, type: string): boolean => {
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
        return typeof response.value === 'string' && response.value.trim().length > 0;
      case 'boolean':
        return typeof response.value === 'string' && ['oui', 'non'].includes(response.value);
      default:
        return false;
    }
  };
  
  const validateAllFields = (): { group?: string, label: string }[] => {
    if (!allItemsLoaded || !allCriteriaItems) {
      console.warn("Cannot validate form - all criteria items not loaded yet");
      return [];
    }

    const missing: { group?: string, label: string }[] = [];

    allCriteriaItems.forEach(item => {
      // Check all item types, not just commentaire
      const response = evaluatorResponses.find(r => r.item_id === item.id);
      if (!isValidResponse(response, item.type)) {
        missing.push({
          label: item.label,
          group: item.group_name || `Group ${item.group_id}`
        });
      }
    });

    setMissingFields(missing);
    setValidationAttempted(true);
    return missing;
  };
  
  // Convertir les réponses au format API pour la soumission
  const convertToApiFormat = () => {
    return evaluatorResponses.map(response => ({
      id_item: response.item_id.toString(),
      reponse_item: response.value.toString(),
      type_item: allCriteriaItems?.find(item => item.id === response.item_id)?.type || 'numeric'
    }));
  };
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Validation checks all types of fields now
    const missing = validateAllFields();
    if (missing.length > 0) {
      toast.error("Formulaire incomplet", {
        description: `${missing.length} champ(s) obligatoire(s) non rempli(s)`,
        duration: 5000
      });
      setIsSubmitting(false);
      return;
    }

    try {
      console.log("Submitting evaluation data...");
      const response = await apiClient.post('/submit_evaluator', {
        evaluation_id: evaluationId,
        responses: convertToApiFormat()
      });

      toast.success("Évaluation soumise avec succès");
      navigate('/evaluations');

    } catch (error) {
      console.error("Erreur lors de la soumission de l'évaluation:", error);
      toast.error("Erreur lors de la soumission", {
        description: "Veuillez réessayer ultérieurement"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleRefuseRequest = async (data: RefusalFormData) => {
    try {
      await apiClient.post('/refuse_evaluation', {
        evaluation_id: evaluationId,
        refusal_reason: data.reason
      });
      
      toast.success("Auto-évaluation refusée", {
        description: "Le collaborateur a été notifié"
      });
      
      setRefusalDialogOpen(false);
      navigate('/evaluations');
    } catch (error) {
      console.error("Erreur lors du refus de l'auto-évaluation:", error);
      toast.error("Erreur lors du refus", {
        description: "Veuillez réessayer ultérieurement"
      });
    }
  };
  
  const handleSaveAsDraft = async () => {
    if (!evaluationId) {
      toast.error("ID d'évaluation manquant", {
        description: "Impossible d'enregistrer le brouillon sans identifiant d'évaluation"
      });
      return;
    }

    setSavingDraft(true);
    
    try {
      await apiClient.post('/brouillon_eval', {
        evaluation_id: evaluationId,
        responses: convertToApiFormat()
      });
      
      toast.success("Brouillon sauvegardé", {
        description: "Votre évaluation a été enregistrée comme brouillon"
      });
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du brouillon:", error);
      toast.error("Échec de la sauvegarde", {
        description: "Impossible d'enregistrer votre évaluation comme brouillon"
      });
    } finally {
      setSavingDraft(false);
    }
  };
  
  if (isLoading || responsesLoading || evaluatorResponsesLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }
  
  // Get evaluator and employee info
  const getEvaluatorInfo = () => {
    if (evaluationInfo?.evaluateur) return evaluationInfo.evaluateur;
    const evaluator = employees.find(emp => emp.id === evaluatorId);
    return evaluator ? `${evaluator.name} - ${evaluator.position}` : 'Non défini';
  };

  const getCollaboratorInfo = () => {
    if (evaluationInfo?.collaborateur) return evaluationInfo.collaborateur;
    const collaborator = employees.find(emp => emp.id === approverId);
    return collaborator ? `${collaborator.name} - ${collaborator.position}` : 'Non défini';
  };

  const getMissionInfo = () => {
    if (evaluationInfo?.mission) return evaluationInfo.mission;
    return selectedMissionId ? `Mission ${selectedMissionId}` : 'Non définie';
  };

  return (
    <div className="space-y-8">
      {/* Information Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-medium text-blue-900 mb-3">Informations sur l'évaluation</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-800">Collaborateur évalué:</span>
            <div className="text-blue-700">{getCollaboratorInfo()}</div>
          </div>
          <div>
            <span className="font-medium text-blue-800">Evaluateur:</span>
            <div className="text-blue-700">{getEvaluatorInfo()}</div>
          </div>
          <div>
            <span className="font-medium text-blue-800">Mission:</span>
            <div className="text-blue-700">{getMissionInfo()}</div>
          </div>
          <div>
            <span className="font-medium text-blue-800">Client:</span>
            <div className="text-blue-700">{searchParams.get('client') || '-'}</div>
          </div>
        </div>
      </div>
      {criteriaItems.map((item) => (
        <div key={item.id} className="p-4 border rounded-md shadow-sm">
          <h3 className="text-lg font-medium mb-4">
            {item.label}
            {item.type === 'commentaire' && (
              <span className="text-sm font-normal ml-2 text-gray-500">
                (obligatoire)
              </span>
            )}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium text-gray-700">Auto-évaluation du collaborateur</h4>
              
              {item.type === 'numeric' ? (
                <div className="mt-4">
                  {renderCollaboratorNumericBox(item.id)}
                </div>
              ) : item.type === 'boolean' ? (
                <div className="mt-4">
                  {renderBooleanResponse(item.id, true)}
                </div>
              ) : (
                <div className="mt-2">
                  <ScrollArea className="h-[120px] w-full rounded-md">
                    <div className="p-3 bg-gray-100 rounded text-gray-600 whitespace-pre-wrap">
                      {getCollaboratorResponseValue(item.id) || "Aucune observation fournie"}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-primary">Votre évaluation</h4>
              
              {item.type === 'numeric' ? (
                <div className="mt-4">
                  {renderEvaluatorNumericBox(item.id)}
                </div>
              ) : item.type === 'boolean' ? (
                <div className="mt-4">
                  {renderBooleanResponse(item.id)}
                </div>
              ) : (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-2">
                    {item.type === 'commentaire' ? "Commentaire obligatoire" : "Entrez votre observation"}
                  </p>
                  <Textarea 
                    value={getEvaluatorResponseValue(item.id).toString()}
                    onChange={(e) => handleEvaluatorResponseChange(item.id, e.target.value)}
                    placeholder={item.type === 'observation' 
                      ? "Entrez votre observation…" 
                      : "Entrez votre commentaire…"}
                    className="min-h-[120px] max-h-[120px] overflow-y-auto"
                  />
                  {item.type === 'observation' && (
                    <div className="text-xs text-right">
                      {typeof getEvaluatorResponseValue(item.id) === 'string' && (
                        <span className={`${(getEvaluatorResponseValue(item.id) as string).trim().length > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {(getEvaluatorResponseValue(item.id) as string).length} caractère(s)
                        </span>
                      )}
                    </div>
                  )}
                  {item.type === 'commentaire' && (
                    <div className="text-xs text-right">
                      {typeof getEvaluatorResponseValue(item.id) === 'string' && (
                        <span className={`${(getEvaluatorResponseValue(item.id) as string).length > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {(getEvaluatorResponseValue(item.id) as string).length} caractère(s)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      
      <div className="flex flex-col md:flex-row gap-4">
        <Button 
          onClick={handleSubmit} 
          className="w-full md:w-auto" 
          disabled={isLoading || responsesLoading || savingDraft || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader className="h-4 w-4 mr-2 animate-spin" />
              Soumission en cours...
            </>
          ) : "Soumettre mon évaluation"}
        </Button>
        
        <Button 
          onClick={handleSaveAsDraft} 
          className="w-full md:w-auto" 
          variant="outline"
          disabled={isLoading || responsesLoading || savingDraft || isSubmitting}
        >
          {savingDraft ? (
            <>
              <Loader className="h-4 w-4 mr-2 animate-spin" />
              Sauvegarde en cours...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Enregistrer comme brouillon
            </>
          )}
        </Button>
        
        <Button 
          onClick={() => setRefusalDialogOpen(true)} 
          className="w-full md:w-auto" 
          variant="outline"
          disabled={isLoading || responsesLoading || savingDraft || isSubmitting}
        >
          Refuser l'auto-évaluation
        </Button>
      </div>
      
      <Dialog open={refusalDialogOpen} onOpenChange={setRefusalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refuser l'auto-évaluation</DialogTitle>
            <DialogDescription>
              Veuillez indiquer la raison du refus. Cette information sera communiquée au collaborateur.
            </DialogDescription>
          </DialogHeader>

          <Form {...refusalForm}>
            <form onSubmit={refusalForm.handleSubmit(handleRefuseRequest)} className="space-y-4">
              <FormField
                control={refusalForm.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Motif du refus..."
                        className="min-h-[120px]"
                        scrollable
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setRefusalDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  variant="destructive"
                  disabled={refusalForm.formState.isSubmitting}
                >
                  {refusalForm.formState.isSubmitting ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Traitement...
                    </>
                  ) : "Confirmer le refus"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EvaluationStepTwo;
