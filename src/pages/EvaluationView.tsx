
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CriteriaItem } from '@/pages/Evaluation';
import { Star } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import HRISNavbar from '@/components/hris/HRISNavbar';
import apiClient from '@/utils/apiClient';

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
          return apiResponses.responses.map((response: any) => ({
            item_id: parseInt(response.id_item),
            value: response.type_item === "numerique" 
              ? parseInt(response.reponse_item) 
              : response.reponse_item
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

  const calculateAverages = () => {
    if (!criteriaItems) return { employeeAvg: '0.0', evaluatorAvg: '0.0' };
    
    const numericItems = criteriaItems.filter((item: CriteriaItem) => item.type === 'numeric');
    
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
                <div className="text-3xl font-bold text-yellow-500 mr-3">{employeeAvg}</div>
                {renderStarRating(parseFloat(employeeAvg))}
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-primary">Évaluation du manager</h4>
              <div className="flex items-center">
                <div className="text-3xl font-bold text-primary mr-3">{evaluatorAvg}</div>
                {renderStarRating(parseFloat(evaluatorAvg))}
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
                            {renderStarRating(Number(getResponseValue(employeeResponses, item.id)) || 0)}
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
                            {renderStarRating(Number(getResponseValue(evaluatorResponses, item.id)) || 0)}
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
