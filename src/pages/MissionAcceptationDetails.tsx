import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, MapPin, User, Building2, FileText, Euro } from 'lucide-react';
import apiClient from '@/utils/apiClient';
import HRISNavbar from '@/components/hris/HRISNavbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface MissionAcceptationDetails {
  id: string;
  code_mission: string;
  libelle_mission: string;
  client: string;
  date_debut: string;
  date_fin: string;
  statut: string;
  demandeur?: string;
  description?: string;
  lieu?: string;
  budget?: number;
  devise?: string;
  intervenants?: string[];
  commentaires?: string;
  date_creation?: string;
  date_modification?: string;
}

const fetchMissionAcceptationDetails = async (id: string): Promise<MissionAcceptationDetails> => {
  const response = await apiClient.get(`/acceptation/${id}/afficher`);
  return response.data;
};

const MissionAcceptationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: mission, isLoading, error } = useQuery({
    queryKey: ['missionAcceptationDetails', id],
    queryFn: () => fetchMissionAcceptationDetails(id!),
    enabled: !!id,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approuvée':
      case 'validee':
      case 'validated':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Approuvée</Badge>;
      case 'En attente':
      case 'en_attente':
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">En attente</Badge>;
      case 'Refusée':
      case 'refusee':
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Refusée</Badge>;
      case 'Annulée':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Annulée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (error) {
    toast({
      title: 'Erreur',
      description: 'Impossible de charger les détails de la mission.',
      variant: 'destructive',
    });
    return (
      <div className="flex flex-col min-h-screen bg-[#f8f9fc]">
        <HRISNavbar />
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
          <div className="text-center py-12">
            <p className="text-red-500">Erreur lors du chargement des détails de la mission.</p>
            <Button onClick={() => navigate(-1)} className="mt-4">
              Retour
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f8f9fc]">
        <HRISNavbar />
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg p-6 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-100 rounded"></div>
                    <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f8f9fc]">
        <HRISNavbar />
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
          <div className="text-center py-12">
            <p className="text-gray-500">Mission non trouvée.</p>
            <Button onClick={() => navigate(-1)} className="mt-4">
              Retour
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fc]">
      <HRISNavbar />
      
      <div className="container mx-auto p-4 md:p-6 lg:p-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">
              Détails de la demande d'acceptation
            </h1>
            <p className="text-gray-500">Mission {mission.code_mission}</p>
          </div>
          {getStatusBadge(mission.statut)}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mission Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informations de la mission
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Code mission</label>
                <p className="text-gray-900 font-medium">{mission.code_mission}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Libellé</label>
                <p className="text-gray-900">{mission.libelle_mission}</p>
              </div>
              {mission.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-gray-900">{mission.description}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Client</label>
                <p className="text-gray-900 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  {mission.client}
                </p>
              </div>
              {mission.lieu && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Lieu</label>
                  <p className="text-gray-900 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {mission.lieu}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dates and Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Dates et planning
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Date de début</label>
                <p className="text-gray-900">{formatDate(mission.date_debut)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Date de fin</label>
                <p className="text-gray-900">{formatDate(mission.date_fin)}</p>
              </div>
              {mission.date_creation && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Date de création</label>
                  <p className="text-gray-900">{formatDateTime(mission.date_creation)}</p>
                </div>
              )}
              {mission.date_modification && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Dernière modification</label>
                  <p className="text-gray-900">{formatDateTime(mission.date_modification)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Budget Information */}
          {(mission.budget || mission.devise) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Euro className="h-5 w-5" />
                  Budget
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mission.budget && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Montant</label>
                    <p className="text-gray-900 font-medium">
                      {mission.budget.toLocaleString('fr-FR')} {mission.devise || '€'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Team Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Équipe et demandeur
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mission.demandeur && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Demandeur</label>
                  <p className="text-gray-900">{mission.demandeur}</p>
                </div>
              )}
              {mission.intervenants && mission.intervenants.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Intervenants</label>
                  <div className="flex flex-wrap gap-2">
                    {mission.intervenants.map((intervenant, index) => (
                      <Badge key={index} variant="secondary">
                        {intervenant}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Comments */}
        {mission.commentaires && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Commentaires</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-900 whitespace-pre-wrap">{mission.commentaires}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MissionAcceptationDetails;