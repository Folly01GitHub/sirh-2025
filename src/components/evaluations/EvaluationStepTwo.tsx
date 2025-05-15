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

interface EvaluationStepTwoProps {
  criteriaItems: CriteriaItem[];
  onResponseChange: (itemId: number, value: string) => void;
  employeeResponses: EvaluationResponse[];
  isLoading: boolean;
  onSubmit: () => void;
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
  onSubmit
}) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const evaluationId = searchParams.get('id');
  
  const [refusalDialogOpen, setRefusalDialogOpen] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
        console.log("Collaborator responses fetched:", response.data);
        return response.data || [];
      } catch (error) {
        console.error("Error fetching collaborator responses:", error);
        return [];
      }
    },
    enabled: !!evaluationId
  });
  
  const [evaluatorResponses, setEvaluatorResponses] = useState<EvaluationResponse[]>([]);
  const [criteriaMissing, setCriteriaMissing] = useState<boolean>(false);
  const [missingFields, setMissingFields] = useState<{ group?: string, label: string }[]>([]);
  
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
            ? (response.reponse_item ? parseFloat(response.reponse_item) : '') 
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
  
  const getCollaboratorResponseValue = (itemId: number) => {
    if (!collaboratorResponses || !collaboratorResponses.length) return "";
    const response = collaboratorResponses.find(r => r.item_id === itemId);
    return response ? response.value : "";
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
  
  const isValidResponse = (response: EvaluationResponse | undefined, type: string): boolean => {
    if (!response) return false;
    
    switch (type) {
      case 'numeric':
        const numericValue = typeof response.value === 'number' ? response.value : 
                          (typeof response.value === 'string' ? Number(response.value) : 0);
        return numericValue >= 1 && numericValue <= 5;
      case 'observation':
        return typeof response.value === 'string' && response.value.length >= 50;
      case 'boolean':
        return typeof response.value === 'string' && ['oui', 'non'].includes(response.value);
      default:
        return false;
    }
  };
  
  const validateAllFields = (): boolean => {
    if (!allItemsLoaded || !allCriteriaItems) {
      console.warn("Cannot validate form - all criteria items not loaded yet");
      return false;
    }
    
    const missing: { group?: string, label: string }[] = [];

    allCriteriaItems.forEach(item => {
      const response = evaluatorResponses.find(r => r.item_id === item.id);
      if (!isValidResponse(response, item.type)) {
        missing.push({
          label: item.label,
          group: item.group_name || `Group ${item.group_id}`
        });
      }
    });

    setMissingFields(missing);
    return missing.length === 0;
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
    
    if (!validateAllFields()) {
      console.log("Échec de la validation du formulaire. Champs manquants :", missingFields);
      
      if (missingFields.length > 0) {
        toast.error("Formulaire incomplet", {
          description: `${missingFields.length} champ(s) obligatoire(s) non rempli(s)`,
          duration: 5000
        });
      }
      
      setIsSubmitting(false);
      return;
    }

    try {
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
  
  return (
    <div className="space-y-8">
      <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
        <p className="text-blue-800">
          En tant qu'évaluateur, vous pouvez consulter l'auto-évaluation du collaborateur 
          et saisir votre propre évaluation. Les deux seront affichées côte à côte pour faciliter la comparaison.
        </p>
      </div>
      
      {criteriaItems.map((item) => (
        <div key={item.id} className="p-4 border rounded-md shadow-sm">
          <h3 className="text-lg font-medium mb-4">{item.label}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium text-gray-700">Auto-évaluation du collaborateur</h4>
              
              {item.type === 'numeric' ? (
                <div className="mt-4">
                  {renderCollaboratorStarRating(item.id)}
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
                  {renderEvaluatorStarRating(item.id)}
                  
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Très insuffisant</span>
                    <span>Excellent</span>
                  </div>
                </div>
              ) : item.type === 'boolean' ? (
                <div className="mt-4">
                  {renderBooleanResponse(item.id)}
                </div>
              ) : (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-2">
                    Minimum 50 caractères
                  </p>
                  <Textarea 
                    value={getEvaluatorResponseValue(item.id).toString()}
                    onChange={(e) => handleEvaluatorResponseChange(item.id, e.target.value)}
                    placeholder="Entrez votre observation…"
                    className="min-h-[120px] max-h-[120px] overflow-y-auto"
                  />
                  <div className="text-xs text-right">
                    {typeof getEvaluatorResponseValue(item.id) === 'string' && (
                      <span className={`${(getEvaluatorResponseValue(item.id) as string).length >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                        {(getEvaluatorResponseValue(item.id) as string).length} / 50 caractères minimum
                      </span>
                    )}
                  </div>
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
