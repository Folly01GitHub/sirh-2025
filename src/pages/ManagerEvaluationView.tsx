import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import HRISNavbar from "@/components/hris/HRISNavbar";
import apiClient from "@/utils/apiClient";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CriteriaItem } from "@/pages/Evaluation";

interface EvaluationNote {
  item_id: number;
  reponse: string;
}

interface ClientData {
  id: number;
  nom_client: string;
  date_debut_intervention: string;
  date_fin_intervention: string;
  etat_avancement: string;
  temps_collaborateur: number;
  temps_equipe: number;
  honoraires: string;
  bonis_malis: string;
}

interface ActiviteData {
  activite_id: number;
  libelle: string;
  nombre_heures: number;
  commentaire: string;
}

interface EvaluationNotesResponse {
  evaluation_id: number;
  clients: ClientData[];
  activites: ActiviteData[];
  notes_collaborateur: EvaluationNote[];
  notes_evaluateur: EvaluationNote[];
  notes_approbateur: EvaluationNote[];
}

interface GroupeItem {
  id: number;
  name: string;
}

interface CriteriaGroup {
  group_id: number;
  group_name: string;
  items: CriteriaItem[];
}

const ManagerEvaluationView = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const evaluationId = searchParams.get("id");
  const [activeGroup, setActiveGroup] = useState<string>("1");
  const [evaluationData, setEvaluationData] = useState<EvaluationNotesResponse | null>(null);

  // Fetch evaluation notes data
  useEffect(() => {
    const fetchEvaluationNotes = async () => {
      if (!evaluationId) {
        toast.error("ID d'évaluation manquant");
        return;
      }

      try {
        const response = await apiClient.get(`/evaluations/${evaluationId}/notes`);
        setEvaluationData(response.data);
      } catch (error) {
        toast.error("Erreur lors de la récupération des données d'évaluation");
        console.error("Error fetching evaluation notes:", error);
      }
    };

    fetchEvaluationNotes();
  }, [evaluationId]);

  // Fetch criteria items for the evaluation group
  const { data: criteriaItems, isLoading: itemsLoading } = useQuery({
    queryKey: ["criteriaItems", evaluationId],
    queryFn: async () => {
      const response = await apiClient.get("/items");
      return response.data;
    }
  });

  // Fetch group items
  const { data: groupeItems, isLoading: groupesLoading } = useQuery({
    queryKey: ["groupeItems"],
    queryFn: async () => {
      const response = await apiClient.get("/groupe_items");
      return response.data;
    }
  });

  // Group criteria items by group
  const groupedCriteria: CriteriaGroup[] =
    Array.isArray(criteriaItems) && criteriaItems.length > 0
      ? criteriaItems.reduce((acc: CriteriaGroup[], item: CriteriaItem) => {
          let group = acc.find((g) => g.group_id === item.group_id);
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

  const getResponseValue = (responses: EvaluationNote[], itemId: number) => {
    const response = responses.find((r) => r.item_id === itemId);
    return response ? response.reponse : "";
  };

  const handleBackToEvaluations = () => {
    navigate('/evaluations');
  };

  if (itemsLoading || groupesLoading || !evaluationData) {
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
        {/* Bouton de retour */}
        <div className="flex justify-start">
          <Button
            variant="outline"
            onClick={handleBackToEvaluations}
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux évaluations
          </Button>
        </div>

        {/* Détail complet des évaluations */}
        <div className="bg-white p-6 rounded-lg border shadow-sm space-y-6">
          <h3 className="text-xl font-medium mb-6">Détail complet des évaluations</h3>
          
          <Tabs value={activeGroup} onValueChange={setActiveGroup} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="1">Synthèse clients à évaluer</TabsTrigger>
              <TabsTrigger value="2">Récapitulatif feuille de temps</TabsTrigger>
              <TabsTrigger value="3">Évaluation</TabsTrigger>
            </TabsList>

            {/* Groupe 1: Synthèse clients à évaluer */}
            <TabsContent value="1" className="space-y-4">
              {evaluationData.clients.map((client, index) => (
                <Card key={client.id} className="p-4">
                  <CardContent className="space-y-4">
                    <h4 className="font-medium text-lg mb-4">Client {index + 1}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Nom du client</Label>
                        <Input value={client.nom_client} readOnly className="bg-gray-50" />
                      </div>
                      <div>
                        <Label>Date début d'intervention</Label>
                        <Input value={client.date_debut_intervention} readOnly className="bg-gray-50" />
                      </div>
                      <div>
                        <Label>Date fin d'intervention</Label>
                        <Input value={client.date_fin_intervention} readOnly className="bg-gray-50" />
                      </div>
                      <div>
                        <Label>État d'avancement</Label>
                        <Input value={client.etat_avancement} readOnly className="bg-gray-50" />
                      </div>
                      <div>
                        <Label>Temps collaborateur</Label>
                        <Input value={client.temps_collaborateur.toString()} readOnly className="bg-gray-50" />
                      </div>
                      <div>
                        <Label>Temps équipe</Label>
                        <Input value={client.temps_equipe.toString()} readOnly className="bg-gray-50" />
                      </div>
                      <div>
                        <Label>Honoraires</Label>
                        <Input value={client.honoraires} readOnly className="bg-gray-50" />
                      </div>
                      <div>
                        <Label>Bonis/Malis</Label>
                        <Input value={client.bonis_malis} readOnly className="bg-gray-50" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Groupe 2: Récapitulatif feuille de temps */}
            <TabsContent value="2" className="space-y-4">
              {evaluationData.activites.map((activite, index) => (
                <Card key={activite.activite_id} className="p-4">
                  <CardContent className="space-y-4">
                    <h4 className="font-medium text-lg mb-4">Activité {index + 1}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Libellé</Label>
                        <Input value={activite.libelle} readOnly className="bg-gray-50" />
                      </div>
                      <div>
                        <Label>Nombre d'heures</Label>
                        <Input value={activite.nombre_heures.toString()} readOnly className="bg-gray-50" />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Commentaire</Label>
                        <Textarea value={activite.commentaire} readOnly className="bg-gray-50" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Groupe 3: Évaluation */}
            <TabsContent value="3" className="space-y-6">
              {/* Division en trois parties */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Partie gauche: Réponses du manager */}
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold">Réponses du manager à évaluer</h4>
                  {groupedCriteria
                    .filter(group => group.group_id === 3) // Groupe d'évaluation
                    .map(group => 
                      group.items.map((item: CriteriaItem) => (
                        <div key={`manager-${item.id}`} className="p-4 border rounded-md bg-gray-50">
                          <h5 className="font-medium mb-2">{item.label}</h5>
                          <div className="mt-2">
                            <Textarea
                              value={getResponseValue(evaluationData.notes_collaborateur, item.id)}
                              readOnly
                              className="bg-gray-100"
                              placeholder="Aucune réponse fournie"
                            />
                          </div>
                        </div>
                      ))
                    )
                  }
                </div>

                {/* Partie droite: Réponses de l'évaluateur */}
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold">Réponses de l'évaluateur</h4>
                  {groupedCriteria
                    .filter(group => group.group_id === 3) // Groupe d'évaluation
                    .map(group => 
                      group.items.map((item: CriteriaItem) => (
                        <div key={`evaluator-${item.id}`} className="p-4 border rounded-md bg-blue-50">
                          <h5 className="font-medium mb-2">{item.label}</h5>
                          <div className="mt-2">
                            <Textarea
                              value={getResponseValue(evaluationData.notes_evaluateur, item.id)}
                              readOnly
                              className="bg-blue-100"
                              placeholder="Aucune réponse fournie"
                            />
                          </div>
                        </div>
                      ))
                    )
                  }
                </div>
              </div>

              {/* Partie du bas: Réponses de l'associé */}
              <div className="space-y-6">
                <h4 className="text-lg font-semibold">Réponses de l'associé</h4>
                {groupedCriteria
                  .filter(group => group.group_id === 3) // Groupe d'évaluation
                  .map(group => 
                    group.items.map((item: CriteriaItem) => (
                      <div key={`associate-${item.id}`} className="p-4 border rounded-md bg-green-50">
                        <h5 className="font-medium mb-2">{item.label}</h5>
                        <div className="mt-2">
                          <Textarea
                            value={getResponseValue(evaluationData.notes_approbateur, item.id)}
                            readOnly
                            className="bg-green-100"
                            placeholder="Aucune réponse fournie"
                          />
                        </div>
                      </div>
                    ))
                  )
                }
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ManagerEvaluationView;