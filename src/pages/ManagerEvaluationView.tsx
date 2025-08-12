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
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
interface EvaluationItem {
  id: number;
  titre: string;
  description: string;
}

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

interface EvaluationGroup {
  group_id: number;
  group_name: string;
  items: EvaluationItem[];
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

  // Fetch evaluation items for manager evaluations
  const { data: evaluationItems, isLoading: itemsLoading } = useQuery({
    queryKey: ["evaluationItems", evaluationId],
    queryFn: async () => {
      const response = await apiClient.get("/item-manager");
      return response.data.data;
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

  // Les items d'évaluation des managers sont simples - pas besoin de groupes
  const evaluationItemsList = Array.isArray(evaluationItems) ? evaluationItems : [];

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
              <div className="overflow-x-auto">
                <Table className="text-sm [&_th]:py-2 [&_td]:py-2 [&_th]:px-2 [&_td]:px-2">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Date début</TableHead>
                      <TableHead>Date fin</TableHead>
                      <TableHead>État d'avancement</TableHead>
                      <TableHead>Temps collaborateur</TableHead>
                      <TableHead>Temps équipe</TableHead>
                      <TableHead>Honoraires</TableHead>
                      <TableHead>Bonis/Malis</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {evaluationData.clients.length > 0 ? (
                      evaluationData.clients.map((client) => (
                        <TableRow key={client.id}>
                          <TableCell>{client.nom_client || "-"}</TableCell>
                          <TableCell>{client.date_debut_intervention || "-"}</TableCell>
                          <TableCell>{client.date_fin_intervention || "-"}</TableCell>
                          <TableCell>{client.etat_avancement || "-"}</TableCell>
                          <TableCell>{client.temps_collaborateur ?? "-"}</TableCell>
                          <TableCell>{client.temps_equipe ?? "-"}</TableCell>
                          <TableCell>{client.honoraires || "-"}</TableCell>
                          <TableCell>{client.bonis_malis || "-"}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground">
                          Aucun client
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Groupe 2: Récapitulatif feuille de temps */}
            <TabsContent value="2" className="space-y-4">
              <div className="overflow-x-auto">
                <Table className="text-sm [&_th]:py-2 [&_td]:py-2 [&_th]:px-2 [&_td]:px-2">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Libellé activité</TableHead>
                      <TableHead>Nombre d'heures passées</TableHead>
                      <TableHead>Commentaires éventuels</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {evaluationData.activites.length > 0 ? (
                      evaluationData.activites.map((activite) => (
                        <TableRow key={activite.activite_id}>
                          <TableCell>{activite.libelle || "-"}</TableCell>
                          <TableCell>{activite.nombre_heures ?? "-"}</TableCell>
                          <TableCell>{activite.commentaire || "-"}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          Aucune activité
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Groupe 3: Évaluation */}
            <TabsContent value="3" className="space-y-6">
              {/* Division en trois parties */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Partie gauche: Réponses du manager */}
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold">Réponses du manager à évaluer</h4>
                  {evaluationItemsList.map((item: EvaluationItem) => (
                    <div key={`manager-${item.id}`} className="p-4 border rounded-md bg-gray-50">
                      <h5 className="font-medium mb-2">{item.titre}</h5>
                      <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                      <div className="mt-2">
                        <Textarea
                          value={getResponseValue(evaluationData.notes_collaborateur, item.id)}
                          readOnly
                          className="bg-gray-100"
                          placeholder="Aucune réponse fournie"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Partie droite: Réponses de l'évaluateur */}
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold">Réponses de l'évaluateur</h4>
                  {evaluationItemsList.map((item: EvaluationItem) => (
                    <div key={`evaluator-${item.id}`} className="p-4 border rounded-md bg-blue-50">
                      <h5 className="font-medium mb-2">{item.titre}</h5>
                      <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                      <div className="mt-2">
                        <Textarea
                          value={getResponseValue(evaluationData.notes_evaluateur, item.id)}
                          readOnly
                          className="bg-blue-100"
                          placeholder="Aucune réponse fournie"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Partie du bas: Réponses de l'associé */}
              <div className="space-y-6">
                <h4 className="text-lg font-semibold">Réponses de l'associé</h4>
                {evaluationItemsList.map((item: EvaluationItem) => (
                  <div key={`associate-${item.id}`} className="p-4 border rounded-md bg-green-50">
                    <h5 className="font-medium mb-2">{item.titre}</h5>
                    <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                    <div className="mt-2">
                      <Textarea
                        value={getResponseValue(evaluationData.notes_approbateur, item.id)}
                        readOnly
                        className="bg-green-100"
                        placeholder="Aucune réponse fournie"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ManagerEvaluationView;