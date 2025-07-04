import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CriteriaItem, Employee } from '@/pages/Evaluation';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Save, Loader, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import apiClient from '@/utils/apiClient';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { NumericBoxGroup } from './NumericBoxGroup';

interface Mission {
  id: number;
  nom: string;
}

interface EvaluationStepOneProps {
  criteriaItems: CriteriaItem[];
  onResponseChange: (itemId: number, value: string | number) => void;
  responses: EvaluationResponse[];
  employees: Employee[];
  onEvaluatorChange: (id: number) => void;
  onApproverChange: (id: number) => void;
  isLoading: boolean;
  onSubmit: () => void;
  onMissionChange?: (id: number) => void;
  selectedMissionId?: number | null;
  selectedEvaluatorId?: number | null;
  selectedApproverId?: number | null;
}

interface EvaluationResponse {
  item_id: number;
  value: string | number;
}

interface CollabResponse {
  mission_id: string;
  evaluator_id: string;
  approver_id: string;
  responses: {
    id_item: string;
    reponse_item: string;
    type_item: string;
  }[];
}

const formSchema = z.object({
  evaluator: z.string().min(1, "Veuillez sélectionner un évaluateur"),
  approver: z.string().min(1, "Veuillez sélectionner un approbateur"),
  mission: z.string().min(1, "Veuillez sélectionner une mission"),
});

const fetchAllCriteriaItems = async (): Promise<CriteriaItem[]> => {
  const response = await apiClient.get('/items');
  return response.data;
};

const EvaluationStepOne: React.FC<EvaluationStepOneProps> = ({
  criteriaItems,
  onResponseChange,
  responses,
  employees,
  onEvaluatorChange,
  onApproverChange,
  isLoading,
  onSubmit,
  onMissionChange,
  selectedMissionId,
  selectedEvaluatorId,
  selectedApproverId
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const evaluationId = searchParams.get('id');
  
  const formRef = useRef<HTMLFormElement>(null);
  
  const scrollToTop = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const [missionQuery, setMissionQuery] = useState("");
  const [missionOptions, setMissionOptions] = useState<Mission[]>([]);
  const [missionsLoading, setMissionsLoading] = useState(false);
  const [missionsError, setMissionsError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  
  const [evaluatorQuery, setEvaluatorQuery] = useState("");
  const [evaluatorOptions, setEvaluatorOptions] = useState<Employee[]>([]);
  const [evaluatorLoading, setEvaluatorLoading] = useState(false);

  const [approverQuery, setApproverQuery] = useState("");
  const [approverOptions, setApproverOptions] = useState<Employee[]>([]);
  const [approverLoading, setApproverLoading] = useState(false);

  const { data: allCriteriaItems, isLoading: allItemsLoading } = useQuery({
    queryKey: ['allCriteriaItems'],
    queryFn: fetchAllCriteriaItems
  });

  useEffect(() => {
    setMissionsLoading(true);
    setMissionsError(null);
    const handler = setTimeout(() => {
      apiClient.get(`/liste_missions?search=${encodeURIComponent(missionQuery)}`)
        .then(res => {
          setMissionOptions(Array.isArray(res.data) ? res.data : []);
        })
        .catch(() => {
          setMissionsError("Erreur lors du chargement des missions");
          setMissionOptions([]);
        })
        .finally(() => setMissionsLoading(false));
    }, 250);
    return () => clearTimeout(handler);
  }, [missionQuery]);

  useEffect(() => {
    if (!missionQuery) setMissionOptions([]);
  }, [missionQuery]);

  useEffect(() => {
    setEvaluatorLoading(true);
    const handler = setTimeout(() => {
      apiClient.get(`/employees_list?search=${encodeURIComponent(evaluatorQuery)}`)
        .then(res => {
          setEvaluatorOptions(Array.isArray(res.data) ? res.data : []);
        })
        .catch(() => {
          setEvaluatorOptions([]);
        })
        .finally(() => setEvaluatorLoading(false));
    }, 250);
    return () => clearTimeout(handler);
  }, [evaluatorQuery]);

  useEffect(() => {
    setApproverLoading(true);
    const handler = setTimeout(() => {
      apiClient.get(`/approver_list?search=${encodeURIComponent(approverQuery)}`)
        .then(res => {
          setApproverOptions(Array.isArray(res.data) ? res.data : []);
        })
        .catch(() => {
          setApproverOptions([]);
        })
        .finally(() => setApproverLoading(false));
    }, 250);
    return () => clearTimeout(handler);
  }, [approverQuery]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      evaluator: selectedEvaluatorId ? selectedEvaluatorId.toString() : "",
      approver: selectedApproverId ? selectedApproverId.toString() : "",
      mission: selectedMissionId ? selectedMissionId.toString() : "",
    },
    mode: "onSubmit"
  });

  useEffect(() => {
    if (selectedMissionId) {
      form.setValue("mission", selectedMissionId.toString());
    }
  }, [selectedMissionId, form]);

  useEffect(() => {
    if (selectedEvaluatorId) {
      form.setValue("evaluator", selectedEvaluatorId.toString());
    }
  }, [selectedEvaluatorId, form]);

  useEffect(() => {
    if (selectedApproverId) {
      form.setValue("approver", selectedApproverId.toString());
    }
  }, [selectedApproverId, form]);

  // Fonction de formatage identique à EvaluationView.tsx
  const formatResponses = (apiResponses: any): EvaluationResponse[] => {
    if (!apiResponses || !apiResponses.responses) {
      return [];
    }

    return apiResponses.responses
      .filter((response: any) => response && response.id_item)
      .map((response: any) => ({
        item_id: parseInt(response.id_item),
        value:
          response.type_item === "numerique" || response.type_item === "numeric"
            ? response.reponse_item
              ? parseInt(response.reponse_item)
              : 0
            : response.reponse_item || ""
      }));
  };

  useEffect(() => {
    if (evaluationId) {
      apiClient.get<CollabResponse>(`/collab_responses?evaluation_id=${evaluationId}`)
        .then(response => {
          form.setValue("evaluator", response.data.evaluator_id);
          form.setValue("approver", response.data.approver_id);
          form.setValue("mission", response.data.mission_id);
          
          onEvaluatorChange(Number(response.data.evaluator_id));
          onApproverChange(Number(response.data.approver_id));
          if (onMissionChange) {
            onMissionChange(Number(response.data.mission_id));
          }
          
          // Utiliser la fonction formatResponses identique à EvaluationView.tsx
          const formattedResponses = formatResponses(response.data);
          formattedResponses.forEach(resp => {
            onResponseChange(resp.item_id, resp.value);
          });
        })
        .catch(error => {
          console.error('Error fetching responses:', error);
          toast.error("Erreur lors du chargement des réponses", {
            description: "Impossible de charger les réponses existantes"
          });
        });
    }
  }, [evaluationId]);

  const getResponseValue = (itemId: number) => {
    const response = responses.find(r => r.item_id === itemId);
    const value = response ? response.value : "";
    return value;
  };

  // Helper function to validate a response based on criteria type
  const isValidResponse = useCallback((response: EvaluationResponse | undefined, type: string): boolean => {
    if (!response) {
      return false;
    }
    
    switch (type) {
      case 'numeric':
        // Accept "N/A" as a valid response for numeric items
        if (response.value === "N/A") return true;
        const numericValue = typeof response.value === 'number' ? response.value : 
                          (typeof response.value === 'string' ? Number(response.value) : 0);
        const isNumericValid = numericValue >= 1 && numericValue <= 5;
        return isNumericValid;
      case 'observation':
        if (typeof response.value !== 'string') {
          return false;
        }
        // Remove the 50-character minimum check and just verify it's not empty
        const isObservationValid = response.value.trim().length > 0;
        return isObservationValid;
      case 'commentaire':
        if (typeof response.value !== 'string') {
          return false;
        }
        const isCommentaireValid = response.value.trim().length > 0;
        return isCommentaireValid;
      case 'boolean':
        if (typeof response.value !== 'string') {
          return false;
        }
        const isBooleanValid = ['oui', 'non'].includes(response.value);
        return isBooleanValid;
      default:
        return false;
    }
  }, []);

  const validateAllFields = (): boolean => {
    if (!allCriteriaItems || allCriteriaItems.length === 0) {
      console.warn("Cannot validate form - all criteria items not loaded yet");
      toast.error("Erreur de validation", { 
        description: "Impossible de valider tous les champs. Veuillez réessayer."
      });
      return false;
    }
    
    const missing: { group?: string, label: string, type: string }[] = [];

    const formValues = form.getValues();
    
    // Check if any of the selectors (evaluator, approver, mission) are empty
    const hasEmptySelectors = !formValues.evaluator || !formValues.approver || !formValues.mission;
    
    if (hasEmptySelectors) {
      toast.error("Champs obligatoires manquants", {
        description: "Assurez-vous d'avoir bien sélectionné l'évaluateur, l'approbateur et la mission en début de formulaire svp !",
        duration: 6000
      });
      return false;
    }
    
    // Continue with other validations for all mandatory fields
    let missingFieldsCount = 0;
    
    allCriteriaItems.forEach(item => {
      const response = responses.find(r => r.item_id === item.id);
      if (!isValidResponse(response, item.type)) {
        missing.push({
          label: item.label,
          group: item.group_name || `Group ${item.group_id}`,
          type: item.type
        });
        missingFieldsCount++;
      }
    });

    if (missingFieldsCount > 0) {
      const message = `Veuillez compléter tous les champs obligatoires avant de soumettre votre auto-évaluation:\n\n${
        missing.map(item => `- ${item.group ? `${item.group}: ` : ''}${item.label}`).join('\n')
      }`;
      console.error('Validation failed:', message);
      toast.error("Formulaire incomplet", {
        description: `${missingFieldsCount} champ(s) obligatoire(s) non rempli(s)`,
        duration: 5000
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAllFields()) {
      console.error('Field validation failed');
      return;
    }

    const missionId = Number(form.getValues("mission"));
    const evaluatorId = Number(form.getValues("evaluator"));
    const approverId = Number(form.getValues("approver"));
    
    const submissionData = {
      mission_id: missionId,
      evaluator_id: evaluatorId,
      approver_id: approverId,
      evaluation_id: evaluationId ? Number(evaluationId) : null,
      responses: responses.map(r => ({
        item_id: r.item_id,
        value: r.value
      }))
    };
    
    try {
      const response = await apiClient.post('/submit_auto_evaluation', submissionData);
      console.log('Auto-evaluation submitted successfully:', response.data);
      toast.success(evaluationId ? "Auto-évaluation mise à jour" : "Auto-évaluation soumise", {
        description: "Votre évaluateur a été notifié"
      });
      
      if (onMissionChange) onMissionChange(submissionData.mission_id);
      onSubmit();
      
      setTimeout(() => {
        navigate('/evaluations');
      }, 1000);
    } catch (error) {
      console.error("Erreur lors de la soumission de l'auto-évaluation:", error);
      
      let errorMessage = "Une erreur est survenue. Veuillez réessayer.";
      if ((error as any).response?.data?.message) {
        errorMessage = (error as any).response.data.message;
      }
      
      toast.error("Échec de la soumission", {
        description: errorMessage
      });
    }
  };

  const handleSaveAsDraft = async () => {
    setSavingDraft(true);
    
    const formValues = form.getValues();
    const missionId = formValues.mission ? Number(formValues.mission) : null;
    const evaluatorId = formValues.evaluator ? Number(formValues.evaluator) : null;
    const approverId = formValues.approver ? Number(formValues.approver) : null;
    
    const draftData = {
      mission_id: missionId,
      evaluator_id: evaluatorId,
      approver_id: approverId,
      evaluation_id: evaluationId ? Number(evaluationId) : null,
      responses: responses.map(r => ({
        item_id: r.item_id,
        value: r.value
      }))
    };
    
    try {
      const response = await apiClient.post('/auto_draft', draftData);
      
      toast.success("Brouillon sauvegardé", {
        description: "Votre auto-évaluation a été enregistrée comme brouillon"
      });
      
      if (response.data.evaluation_id && !evaluationId) {
        navigate(`/evaluation?id=${response.data.evaluation_id}&step=1`);
      }
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du brouillon:", error);
      
      toast.error("Échec de la sauvegarde", {
        description: "Impossible d'enregistrer votre auto-évaluation comme brouillon"
      });
    } finally {
      setSavingDraft(false);
    }
  };

  const renderBooleanResponse = (itemId: number) => {
    const currentValue = getResponseValue(itemId) as string;
    
    return (
      <RadioGroup
        value={currentValue}
        onValueChange={(value) => onResponseChange(itemId, value)}
        className="flex gap-6"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="oui" id={`oui-${itemId}`} />
          <label htmlFor={`oui-${itemId}`} className="text-sm font-medium">
            Oui
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="non" id={`non-${itemId}`} />
          <label htmlFor={`non-${itemId}`} className="text-sm font-medium">
            Non
          </label>
        </div>
      </RadioGroup>
    );
  };

  const evaluatorSelectOptions = evaluatorOptions.map(e => ({
    value: e.id.toString(),
    label: `${e.name} - ${e.position}`,
  }));

  const approverSelectOptions = approverOptions.map(e => ({
    value: e.id.toString(),
    label: `${e.name} - ${e.position}`,
  }));

  const missionSelectOptions = missionOptions.map(m => ({
    value: m.id.toString(),
    label: m.nom,
  }));

  if (isLoading && criteriaItems.length === 0) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="evaluator"
              render={({ field }) => (
                <FormItem>
                  <SearchableSelect
                    label="Évaluateur"
                    placeholder="Sélectionnez ou cherchez…"
                    value={field.value}
                    onChange={value => {
                      field.onChange(value);
                      onEvaluatorChange(Number(value));
                    }}
                    onSearch={setEvaluatorQuery}
                    options={evaluatorSelectOptions}
                    loading={evaluatorLoading}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="approver"
              render={({ field }) => (
                <FormItem>
                  <SearchableSelect
                    label="Approbateur"
                    placeholder="Sélectionnez ou cherchez…"
                    value={field.value}
                    onChange={value => {
                      field.onChange(value);
                      onApproverChange(Number(value));
                    }}
                    onSearch={setApproverQuery}
                    options={approverSelectOptions}
                    loading={approverLoading}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mission"
              render={({ field }) => (
                <FormItem>
                  <SearchableSelect
                    label="Mission"
                    placeholder="Sélectionnez ou cherchez…"
                    value={field.value}
                    onChange={val => {
                      field.onChange(val);
                      if (onMissionChange) onMissionChange(Number(val));
                    }}
                    onSearch={setMissionQuery}
                    options={missionSelectOptions}
                    loading={missionsLoading}
                    disabled={!!missionsError}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {criteriaItems.map((item) => (
            <div key={item.id} className="p-4 border rounded-md shadow-sm">
              <h3 className="text-lg font-medium mb-3">
                {item.label}
                {item.type === 'commentaire' && (
                  <span className="text-sm font-normal ml-2 text-gray-500">
                    (obligatoire)
                  </span>
                )}
              </h3>
              
              {item.type === 'numeric' ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 mb-2">Sélectionnez une note de 1 à 5</p>
                  <NumericBoxGroup
                    value={getResponseValue(item.id)}
                    onChange={val => {
                      onResponseChange(item.id, val);
                    }}
                  />
                </div>
              ) : item.type === 'boolean' ? (
                <div className="space-y-2">
                  {renderBooleanResponse(item.id)}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 mb-2">
                    {item.type === 'commentaire' ? "Commentaire obligatoire" : "Entrez votre observation"}
                  </p>
                  <Textarea 
                    value={getResponseValue(item.id) as string}
                    onChange={(e) => onResponseChange(item.id, e.target.value)}
                    placeholder={item.type === 'observation' 
                      ? "Entrez votre observation…" 
                      : "Entrez votre commentaire…"}
                    className="min-h-[120px]"
                  />
                  {item.type === 'observation' && (
                    <div className="text-xs text-right">
                      {typeof getResponseValue(item.id) === 'string' && (
                        <span className={`${(getResponseValue(item.id) as string).length > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {(getResponseValue(item.id) as string).length} caractère(s)
                        </span>
                      )}
                    </div>
                  )}
                  {item.type === 'commentaire' && (
                    <div className="text-xs text-right">
                      {typeof getResponseValue(item.id) === 'string' && (
                        <span className={`${(getResponseValue(item.id) as string).length > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {(getResponseValue(item.id) as string).length} caractère(s)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          
          {form.formState.errors.root && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.root.message}
            </p>
          )}
          
          <div className="flex flex-col md:flex-row gap-4">
            <Button 
              type="submit" 
              className="w-full md:w-auto" 
              disabled={isLoading || allItemsLoading}
            >
              {submitting && form.getValues("evaluator") && form.getValues("approver") && form.getValues("mission") ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Soumission en cours...
                </>
              ) : "Soumettre mon auto-évaluation"}
            </Button>
            
            <Button 
              type="button"
              variant="outline"
              className="w-full md:w-auto"
              onClick={handleSaveAsDraft}
              disabled={isLoading || allItemsLoading || savingDraft}
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
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EvaluationStepOne;
