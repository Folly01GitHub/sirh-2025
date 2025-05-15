import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CriteriaItem } from "@/pages/Evaluation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import HRISNavbar from "@/components/hris/HRISNavbar";
import apiClient from "@/utils/apiClient";
import NumericBoxGroup from "@/components/evaluations/NumericBoxGroup";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface EvaluationResponse {
  item_id: number;
  value: string | number;
}

interface CriteriaGroup {
  group_id: number;
  group_name: string;
  items: CriteriaItem[];
}

interface GroupeItem {
  id: number;
  name: string;
}

const EvaluationView = () => {
  const [searchParams] = useSearchParams();
  const evaluationId = searchParams.get("id");
  const [employeeResponses, setEmployeeResponses] = useState<EvaluationResponse[]>([]);
  const [evaluatorResponses, setEvaluatorResponses] = useState<EvaluationResponse[]>([]);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [clickedGroupName, setClickedGroupName] = useState<string | null>(null);
  const [showFullName, setShowFullName] = useState<boolean>(false);

  const { data: criteriaItems, isLoading: itemsLoading } = useQuery({
    queryKey: ["criteriaItems", evaluationId],
    queryFn: async () => {
      const response = await apiClient.get("/items");
      return response.data;
    }
  });

  // Nouvelle requête pour obtenir la liste des groupes depuis l'API
  const { data: groupeItems, isLoading: groupesLoading } = useQuery({
    queryKey: ["groupeItems"],
    queryFn: async () => {
      const response = await apiClient.get("/groupe_items");
      return response.data;
    }
  });

  // Regrouper les criteriaItems par groupes, en intégrant le vrai nom via l'API /groupe_items
  const groupedCriteria: CriteriaGroup[] =
    Array.isArray(criteriaItems) && criteriaItems.length > 0
      ? criteriaItems.reduce((acc: CriteriaGroup[], item: CriteriaItem) => {
          let group = acc.find((g) => g.group_id === item.group_id);
          // Chercher le vrai nom du groupe depuis l'API
          const groupFromApi = Array.isArray(groupeItems)
            ? groupeItems.find((g: GroupeItem) => g.id === item.group_id)
            : undefined;
          if (!group) {
            group = {
              group_id: item.group_id,
              group_name: groupFromApi?.name || `Groupe ${item.group_id}`,
              items: []
            };
            acc.push(group);
          }
          group.items.push(item);
          return acc;
        }, [])
      : [];

  // Définir le groupe actif au premier onglet par défaut
  useEffect(() => {
    if (groupedCriteria.length > 0 && !activeGroup) {
      setActiveGroup(String(groupedCriteria[0].group_id));
    }
  }, [groupedCriteria, activeGroup]);

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
              value:
                response.type_item === "numerique" || response.type_item === "numeric"
                  ? response.reponse_item
                    ? parseInt(response.reponse_item)
                    : 0
                  : response.reponse_item || ""
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
    const response = responses.find((r) => r.item_id === itemId);
    return response ? response.value : "";
  };

  const calculateAverages = () => {
    if (!criteriaItems) return { employeeAvg: "0.0", evaluatorAvg: "0.0" };

    const numericItems = criteriaItems.filter((item: CriteriaItem) => item.type === "numeric");
    if (numericItems.length === 0) return { employeeAvg: "0.0", evaluatorAvg: "0.0" };

    let employeeSum = 0;
    let employeeCount = 0;
    numericItems.forEach((item) => {
      const value = Number(getResponseValue(employeeResponses, item.id));
      if (!isNaN(value) && value > 0) {
        employeeSum += value;
        employeeCount++;
      }
    });

    let evaluatorSum = 0;
    let evaluatorCount = 0;
    numericItems.forEach((item) => {
      const value = Number(getResponseValue(evaluatorResponses, item.id));
      if (!isNaN(value) && value > 0) {
        evaluatorSum += value;
        evaluatorCount++;
      }
    });

    const employeeAvg = employeeCount > 0 ? (employeeSum / employeeCount).toFixed(1) : "0.0";
    const evaluatorAvg = evaluatorCount > 0 ? (evaluatorSum / evaluatorCount).toFixed(1) : "0.0";

    return { employeeAvg, evaluatorAvg };
  };

  const { employeeAvg, evaluatorAvg } = calculateAverages();

  // Helper function to truncate long titles for tab display
  const truncateGroupName = (name: string, maxLength = 20) => {
    if (name.length <= maxLength) return name;
    return `${name.substring(0, maxLength)}...`;
  };

  // Function to handle tab click and show the full name
  const handleTabClick = (groupName: string) => {
    setClickedGroupName(groupName);
    setShowFullName(true);
    
    // Automatically hide the full name after a delay
    setTimeout(() => {
      setShowFullName(false);
    }, 3000); // Hide after 3 seconds
  };

  if (itemsLoading || groupesLoading) {
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

        {/* Détail complet en tabs par groupe, avec noms dynamiques */}
        <div className="bg-white p-6 rounded-lg border shadow-sm space-y-6 mt-4">
          <h3 className="text-xl font-medium mb-6">Détail complet des évaluations</h3>
          
          {/* Full group name display when tab is clicked */}
          {showFullName && clickedGroupName && (
            <div className="bg-primary/10 text-primary py-2 px-4 rounded-md mb-4 text-center animate-fade-in">
              {clickedGroupName}
            </div>
          )}
          
          {groupedCriteria.length > 0 && (
            <Tabs value={activeGroup ?? undefined} onValueChange={(v) => setActiveGroup(v)} className="w-full">
              <ScrollArea className="w-full">
                <TabsList className="mb-4 flex-nowrap w-max">
                  {groupedCriteria.map((group) => (
                    <TooltipProvider key={group.group_id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <TabsTrigger 
                            value={String(group.group_id)}
                            className="min-w-[100px] px-3 whitespace-normal text-center h-auto py-2"
                            onClick={() => handleTabClick(group.group_name)}
                          >
                            {truncateGroupName(group.group_name, 18)}
                          </TabsTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="bg-white p-2 shadow-md z-50">
                          {group.group_name}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </TabsList>
              </ScrollArea>
              {groupedCriteria.map((group) => (
                <TabsContent
                  key={group.group_id}
                  value={String(group.group_id)}
                  className="space-y-6"
                >
                  {group.items.map((item: CriteriaItem) => (
                    <div key={item.id} className="p-4 border rounded-md">
                      <h3 className="text-lg font-medium mb-4">{item.label}</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 bg-gray-50 p-4 rounded-md">
                          <h4 className="font-medium text-gray-700">
                            Auto-évaluation du collaborateur
                          </h4>

                          {item.type === "numeric" ? (
                            <div className="mt-4">
                              <NumericBoxGroup
                                value={Number(getResponseValue(employeeResponses, item.id)) || 0}
                                readOnly
                              />
                            </div>
                          ) : item.type === "boolean" ? (
                            <div className="mt-4">
                              <div className="p-3 rounded">
                                {getResponseValue(employeeResponses, item.id) === "oui"
                                  ? "Oui"
                                  : getResponseValue(employeeResponses, item.id) === "non"
                                  ? "Non"
                                  : "Non spécifié"}
                              </div>
                            </div>
                          ) : (
                            <div className="mt-2">
                              <ScrollArea className="h-[100px] w-full rounded-md">
                                <div className="p-3 bg-gray-100 rounded text-gray-600 whitespace-pre-wrap">
                                  {getResponseValue(employeeResponses, item.id) ||
                                    "Aucune observation fournie"}
                                </div>
                              </ScrollArea>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2 bg-blue-50 p-4 rounded-md">
                          <h4 className="font-medium text-primary">Évaluation du manager</h4>

                          {item.type === "numeric" ? (
                            <div className="mt-4">
                              <NumericBoxGroup
                                value={Number(getResponseValue(evaluatorResponses, item.id)) || 0}
                                readOnly
                              />
                            </div>
                          ) : item.type === "boolean" ? (
                            <div className="mt-4">
                              <div className="p-3 rounded">
                                {getResponseValue(evaluatorResponses, item.id) === "oui"
                                  ? "Oui"
                                  : getResponseValue(evaluatorResponses, item.id) === "non"
                                  ? "Non"
                                  : "Non spécifié"}
                              </div>
                            </div>
                          ) : (
                            <div className="mt-2">
                              <ScrollArea className="h-[100px] w-full rounded-md">
                                <div className="p-3 bg-blue-100 rounded text-blue-800 whitespace-pre-wrap">
                                  {getResponseValue(evaluatorResponses, item.id) ||
                                    "Aucune observation fournie"}
                                </div>
                              </ScrollArea>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
};

export default EvaluationView;
