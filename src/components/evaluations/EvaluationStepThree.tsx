
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CriteriaItem, EvaluationResponse } from '@/pages/Evaluation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, CheckCircle, XCircle, Loader, ChevronLeft, ChevronRight } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import apiClient from '@/utils/apiClient';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import NumericBoxGroup from "./NumericBoxGroup";

interface ApiResponse {
  mission_id: string;
  evaluator_id: string;
  approver_id: string;
  responses: Array<{
    id_item: string;
    reponse_item: string;
    type_item: string;
  }>;
}

interface EvaluationStepThreeProps {
  criteriaItems: CriteriaItem[];
  isLoading: boolean;
  onApprove: (approved: boolean, comment?: string) => void;
}

const EvaluationStepThree: React.FC<EvaluationStepThreeProps> = ({
  criteriaItems,
  isLoading,
  onApprove
}) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const evaluationId = searchParams.get('id');
  const [comment, setComment] = useState("");
  const [showRejectionComment, setShowRejectionComment] = useState(false);
  const [employeeResponses, setEmployeeResponses] = useState<EvaluationResponse[]>([]);
  const [evaluatorResponses, setEvaluatorResponses] = useState<EvaluationResponse[]>([]);
  const [isLoadingResponses, setIsLoadingResponses] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Initialiser l'accordéon à "ouvert" par défaut
  const [accordionValue, setAccordionValue] = useState<string>("details");
  // Add current group ID state
  const [currentGroupId, setCurrentGroupId] = useState<number>(0);
  // Store criteria groups data
  const [criteriaGroups, setCriteriaGroups] = useState<Array<{id: number, name: string}>>([]);

  useEffect(() => {
    const fetchResponses = async () => {
      if (!evaluationId) {
        toast.error("ID d'évaluation manquant");
        return;
      }

      setIsLoadingResponses(true);
      try {
        const [collabResponse, evaluatorResponse] = await Promise.all([
          apiClient.get<ApiResponse>(`/collab_responses?evaluation_id=${evaluationId}`),
          apiClient.get<ApiResponse>(`/evaluator_responses?evaluation_id=${evaluationId}`)
        ]);

        const formatResponses = (apiResponses: ApiResponse['responses']): EvaluationResponse[] => {
          return apiResponses.map(response => ({
            item_id: parseInt(response.id_item),
            value: response.type_item === "numerique" 
              ? parseInt(response.reponse_item) 
              : response.reponse_item
          }));
        };

        setEmployeeResponses(formatResponses(collabResponse.data.responses));
        setEvaluatorResponses(formatResponses(evaluatorResponse.data.responses));
      } catch (error) {
        toast.error("Erreur lors de la récupération des réponses");
        console.error("Error fetching responses:", error);
      } finally {
        setIsLoadingResponses(false);
      }
    };

    fetchResponses();
    
    // Fetch criteria groups if needed
    const fetchGroups = async () => {
      try {
        const response = await apiClient.get('/groupe_items');
        setCriteriaGroups(response.data);
        if (response.data && response.data.length > 0) {
          setCurrentGroupId(response.data[0].id);
        }
      } catch (error) {
        console.error("Error fetching criteria groups:", error);
      }
    };
    
    fetchGroups();
  }, [evaluationId]);

  // Effet pour s'assurer que l'accordéon est toujours ouvert quand le contenu change
  useEffect(() => {
    // S'assurer que l'accordéon est ouvert lorsque les critères changent
    // (ce qui indique un changement de groupe)
    setAccordionValue("details");
  }, [criteriaItems]);

  const getResponseValue = (responses: EvaluationResponse[], itemId: number) => {
    const response = responses.find(r => r.item_id === itemId);
    return response ? response.value : "";
  };

  const renderStarRating = (value: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((starValue) => (
          <Star 
            key={starValue}
            className={`h-5 w-5 ${starValue <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const renderNumericBoxReadOnly = (value: number) => (
    <NumericBoxGroup value={value} readOnly />
  );

  const calculateAverages = () => {
    const numericItems = criteriaItems.filter(item => item.type === 'numeric');
    
    const employeeAvg = numericItems.reduce((sum, item) => {
      const value = Number(getResponseValue(employeeResponses, item.id)) || 0;
      return sum + value;
    }, 0) / (numericItems.length || 1);
    
    const evaluatorAvg = numericItems.reduce((sum, item) => {
      const value = Number(getResponseValue(evaluatorResponses, item.id)) || 0;
      return sum + value;
    }, 0) / (numericItems.length || 1);
    
    return {
      employeeAvg: employeeAvg.toFixed(1),
      evaluatorAvg: evaluatorAvg.toFixed(1)
    };
  };

  const { employeeAvg, evaluatorAvg } = calculateAverages();

  const handleApprove = async () => {
    if (!evaluationId) {
      toast.error("ID d'évaluation manquant");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.patch(`/evaluations/${evaluationId}/validate`, {
        statut_eval: "Accepté",
        niveau_eval: "Terminé",
        motif_refus: ""
      });
      
      toast.success("Évaluation validée avec succès");
      navigate('/evaluations');
    } catch (error) {
      console.error("Error validating evaluation:", error);
      toast.error("Erreur lors de la validation de l'évaluation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!comment || comment.trim().length < 10) {
      toast.error("Veuillez fournir un commentaire de rejet d'au moins 10 caractères");
      return;
    }

    if (!evaluationId) {
      toast.error("ID d'évaluation manquant");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await apiClient.patch(`/evaluations/${evaluationId}/validate`, {
        statut_eval: "Refusé",
        niveau_eval: "Terminé",
        motif_refus: comment
      });
      
      toast.success("Évaluation refusée avec succès");
      navigate('/evaluations');
    } catch (error) {
      console.error("Error rejecting evaluation:", error);
      toast.error("Erreur lors du rejet de l'évaluation");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add navigation functions
  const handlePreviousGroup = () => {
    if (criteriaGroups && criteriaGroups.length > 0) {
      const currentIndex = criteriaGroups.findIndex(group => group.id === currentGroupId);
      if (currentIndex > 0) {
        setCurrentGroupId(criteriaGroups[currentIndex - 1].id);
      }
    }
  };
  
  const handleNextGroup = () => {
    if (criteriaGroups && criteriaGroups.length > 0) {
      const currentIndex = criteriaGroups.findIndex(group => group.id === currentGroupId);
      if (currentIndex < criteriaGroups.length - 1) {
        setCurrentGroupId(criteriaGroups[currentIndex + 1].id);
      }
    }
  };

  if (isLoading && criteriaItems.length === 0) {
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
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h3 className="text-xl font-medium mb-4">Résumé de l'évaluation</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">Auto-évaluation</h4>
            <div className="flex items-center">
              <div className="text-3xl font-bold text-yellow-500 mr-3">{employeeAvg}/5</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-primary">Évaluation du manager</h4>
            <div className="flex items-center">
              <div className="text-3xl font-bold text-primary mr-3">{evaluatorAvg}/5</div>
            </div>
          </div>
        </div>
      </div>
      
      <Accordion 
        type="single" 
        collapsible 
        className="w-full"
        value={accordionValue}
        onValueChange={setAccordionValue}
      >
        <AccordionItem value="details">
          <AccordionTrigger>
            Voir le détail complet des évaluations
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6 mt-4">
              {criteriaItems.map((item) => (
                <div key={item.id} className="p-4 border rounded-md">
                  <h3 className="text-lg font-medium mb-4">{item.label}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 bg-gray-50 p-4 rounded-md">
                      <h4 className="font-medium text-gray-700">Auto-évaluation du collaborateur</h4>
                      
                      {item.type === 'numeric' ? (
                        <div className="mt-4">
                          {renderNumericBoxReadOnly(Number(getResponseValue(employeeResponses, item.id)) || 0)}
                        </div>
                      ) : item.type === 'boolean' ? (
                        <div className="mt-4">
                          <div className="p-3 rounded">
                            {getResponseValue(employeeResponses, item.id) === 'oui' ? 'Oui' : 
                             getResponseValue(employeeResponses, item.id) === 'non' ? 'Non' : 
                             'Non spécifié'}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2">
                          <ScrollArea className="h-[100px] w-full rounded-md">
                            <div className="p-3 bg-gray-100 rounded text-gray-600 whitespace-pre-wrap">
                              {getResponseValue(employeeResponses, item.id) || "Aucune observation fournie"}
                            </div>
                          </ScrollArea>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2 bg-blue-50 p-4 rounded-md">
                      <h4 className="font-medium text-primary">Évaluation du manager</h4>
                      
                      {item.type === 'numeric' ? (
                        <div className="mt-4">
                          {renderNumericBoxReadOnly(Number(getResponseValue(evaluatorResponses, item.id)) || 0)}
                        </div>
                      ) : item.type === 'boolean' ? (
                        <div className="mt-4">
                          <div className="p-3 rounded">
                            {getResponseValue(evaluatorResponses, item.id) === 'oui' ? 'Oui' : 
                             getResponseValue(evaluatorResponses, item.id) === 'non' ? 'Non' : 
                             'Non spécifié'}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2">
                          <ScrollArea className="h-[100px] w-full rounded-md">
                            <div className="p-3 bg-blue-100 rounded text-blue-800 whitespace-pre-wrap">
                              {getResponseValue(evaluatorResponses, item.id) || "Aucune observation fournie"}
                            </div>
                          </ScrollArea>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      {/* Navigation buttons moved above the Final Decision section */}
      <div className="flex justify-between mt-8">
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
          disabled={!criteriaItems || criteriaItems.findIndex(g => g.id === currentGroupId) === (criteriaItems.length - 1)}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Suivant
          <ChevronRight className="h-5 w-5 ml-2" />
        </button>
      </div>
      
      {/* Final Decision section moved after the navigation buttons */}
      <div className="bg-gray-50 p-6 rounded-lg border mt-8">
        <h3 className="text-xl font-medium mb-4">Décision finale</h3>
        
        {showRejectionComment ? (
          <div className="space-y-4">
            <p className="text-gray-700">
              Veuillez fournir un commentaire expliquant les raisons du rejet :
            </p>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Détaillez les raisons du rejet et les axes d'amélioration…"
              className="min-h-[150px]"
              scrollable
            />
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Button 
                onClick={() => setShowRejectionComment(false)}
                variant="outline"
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleReject}
                variant="destructive"
                disabled={isLoading || isSubmitting || comment.trim().length < 10}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Confirmer le rejet
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={handleApprove}
              className="bg-green-600 hover:bg-green-700"
              disabled={isLoading || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Validation en cours...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Valider l'évaluation
                </>
              )}
            </Button>
            <Button 
              onClick={() => setShowRejectionComment(true)}
              variant="destructive"
              disabled={isLoading || isSubmitting}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Rejeter l'évaluation
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EvaluationStepThree;
