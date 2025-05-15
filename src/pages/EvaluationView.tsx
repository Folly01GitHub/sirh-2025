
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CriteriaItem } from '@/pages/Evaluation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import HRISNavbar from '@/components/hris/HRISNavbar';
import apiClient from '@/utils/apiClient';
import NumericBoxGroup from '@/components/evaluations/NumericBoxGroup';

interface EvaluationResponse {
  item_id: number;
  value: string | number;
}

const EvaluationView = () => {
  const [searchParams] = useSearchParams();
  const evaluationId = searchParams.get('id');
  const [employeeResponses, setEmployeeResponses] = useState<EvaluationResponse[]>([]);
  const [evaluatorResponses, setEvaluatorResponses] = useState<EvaluationResponse[]>([]);

  const { data: criteriaItems, isLoading: itemsLoading } = useQuery({
    queryKey: ['criteriaItems', evaluationId],
    queryFn: async () => {
      const response = await apiClient.get('/items');
      return response.data;
    }
  });

  useEffect(() => {
    const fetchResponses = async () => {
      if (!evaluationId) {
        toast.error("ID d'évaluation manquant");
        return;
      }

      try {
        const [collabResponse, evaluatorResponse] = await Promise.all([
          apiClient.get(`/collab_responses?evaluation_id=${evaluationId}`),
          apiClient.get(`/evaluator_responses?evaluation_id=${evaluationId}`)
        ]);

        const formatResponses = (apiResponses: any): EvaluationResponse[] => {
          if (!apiResponses || !apiResponses.responses) {
            return [];
          }

          return apiResponses.responses
            .filter((response: any) => response && response.id_item)
            .map((response: any) => ({
              item_id: parseInt(response.id_item),
              value: response.type_item === "numerique" || response.type_item === "numeric"
                ? (response.reponse_item ? parseInt(response.reponse_item) : 0)
                : (response.reponse_item || "")
            }));
        };

        setEmployeeResponses(formatResponses(collabResponse.data));
        setEvaluatorResponses(formatResponses(evaluatorResponse.data));
      } catch (error) {
        toast.error("Erreur lors de la récupération des réponses");
        console.error("Error fetching responses:", error);
      }
    };

    fetchResponses();
  }, [evaluationId]);

  const getResponseValue = (responses: EvaluationResponse[], itemId: number) => {
    const response = responses.find(r => r.item_id === itemId);
    return response ? response.value : "";
  };

  // On garde la fonction NumericBoxGroup car elle est utilisée dans la partie détail !
  const renderNumericBoxGroup = (value: number) => {
    return (
      <NumericBoxGroup value={value} readOnly />
    );
  };

  const calculateAverages = () => {
    if (!criteriaItems) return { employeeAvg: '0.0', evaluatorAvg: '0.0' };

    const numericItems = criteriaItems.filter((item: CriteriaItem) => item.type === 'numeric');
    if (numericItems.length === 0) return { employeeAvg: '0.0', evaluatorAvg: '0.0' };

    let employeeSum = 0;
    let employeeCount = 0;
    numericItems.forEach(item => {
      const value = Number(getResponseValue(employeeResponses, item.id));
      if (!isNaN(value) && value > 0) {
        employeeSum += value;
        employeeCount++;
      }
    });

    let evaluatorSum = 0;
    let evaluatorCount = 0;
    numericItems.forEach(item => {
      const value = Number(getResponseValue(evaluatorResponses, item.id));
      if (!isNaN(value) && value > 0) {
        evaluatorSum += value;
        evaluatorCount++;
      }
    });

    const employeeAvg = employeeCount > 0 ? (employeeSum / employeeCount).toFixed(1) : '0.0';
    const evaluatorAvg = evaluatorCount > 0 ? (evaluatorSum / evaluatorCount).toFixed(1) : '0.0';

    return { employeeAvg, evaluatorAvg };
  };

  const { employeeAvg, evaluatorAvg } = calculateAverages();

  if (itemsLoading) {
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
    <div className="flex flex-col min-h-screen bg-[#f8f9fc]">
      <HRISNavbar />

      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-xl font-medium mb-4">Résumé de l'évaluation</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Auto-évaluation</h4>
              <div className="flex items-center">
                {/* Affichage de la note globale employé, sans cases numériques */}
                <div className="text-3xl font-bold text-yellow-500 mr-3">
                  {employeeAvg}/5
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-primary">Évaluation du manager</h4>
              <div className="flex items-center">
                {/* Affichage de la note globale manager, sans cases numériques */}
                <div className="text-3xl font-bold text-primary mr-3">
                  {evaluatorAvg}/5
                </div>
              </div>
            </div>
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="details">
            <AccordionTrigger>
              Détail complet des évaluations
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-6 mt-4">
                {criteriaItems?.map((item: CriteriaItem) => (
                  <div key={item.id} className="p-4 border rounded-md">
                    <h3 className="text-lg font-medium mb-4">{item.label}</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 bg-gray-50 p-4 rounded-md">
                        <h4 className="font-medium text-gray-700">Auto-évaluation du collaborateur</h4>

                        {item.type === 'numeric' ? (
                          <div className="mt-4">
                            {/* Cases numériques employé (readOnly) */}
                            <NumericBoxGroup value={Number(getResponseValue(employeeResponses, item.id)) || 0} readOnly />
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
                            {/* Cases numériques manager (readOnly) */}
                            <NumericBoxGroup value={Number(getResponseValue(evaluatorResponses, item.id)) || 0} readOnly />
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
      </div>
    </div>
  );
};

export default EvaluationView;
