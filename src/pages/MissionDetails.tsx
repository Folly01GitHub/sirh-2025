
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, User, Building2, MapPin, Phone, Mail, Target, DollarSign, FileText, Clock } from 'lucide-react';
import HRISNavbar from '@/components/hris/HRISNavbar';
import apiClient from '@/utils/apiClient';

interface MissionDetails {
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
  contact_client?: string;
  telephone_contact?: string;
  email_contact?: string;
  objectifs?: string;
  budget?: number;
  created_at?: string;
  updated_at?: string;
  duree?: string;
  type_mission?: string;
  priorite?: string;
  commentaires?: string;
  validation_manager?: string;
  date_validation?: string;
  motif_refus?: string;
  frais_prevus?: number;
  materiel_necessaire?: string;
  competences_requises?: string;
  [key: string]: any; // Pour capturer tous les autres champs
}

const fetchMissionDetails = async (id: string): Promise<MissionDetails> => {
  const response = await apiClient.get(`/demande-mission/${id}`);
  console.log('API Response for mission details:', response.data);
  console.log('All fields received:', Object.keys(response.data));
  return response.data;
};

const MissionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { 
    data: mission, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['missionDetails', id],
    queryFn: () => fetchMissionDetails(id!),
    enabled: !!id
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'validated':
      case 'validee':
      case 'Approuvée':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Approuvée</Badge>;
      case 'pending':
      case 'en_attente':
      case 'En attente':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">En attente</Badge>;
      case 'rejected':
      case 'refusee':
      case 'Refusée':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Refusée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Non spécifié';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'Non spécifié';
    return new Date(dateString).toLocaleString('fr-FR');
  };

  const handleGoBack = () => {
    navigate('/missions');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f8f9fc]">
        <HRISNavbar />
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !mission) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f8f9fc]">
        <HRISNavbar />
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Mission non trouvée</h1>
            <p className="text-gray-500 mb-6">La mission demandée n'existe pas ou n'est pas accessible.</p>
            <Button onClick={handleGoBack} variant="back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux missions
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Fonction pour afficher tous les champs de l'objet mission
  const renderAllFields = () => {
    const excludedFields = ['id', 'code_mission', 'libelle_mission', 'client', 'date_debut', 'date_fin', 'statut'];
    const otherFields = Object.entries(mission).filter(([key]) => !excludedFields.includes(key));
    
    if (otherFields.length === 0) return null;

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Données complètes de l'API</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherFields.map(([key, value]) => (
              <div key={key} className="border-b pb-2">
                <label className="text-sm font-medium text-gray-600 capitalize">
                  {key.replace(/_/g, ' ')}
                </label>
                <p className="text-gray-800 mt-1">
                  {value !== null && value !== undefined 
                    ? (typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value))
                    : 'Non renseigné'
                  }
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fc]">
      <HRISNavbar />
      
      <div className="container mx-auto p-4 md:p-6 lg:p-8 animate-fade-in">
        <div className="flex items-center gap-4 mb-6">
          <Button onClick={handleGoBack} variant="back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{mission.libelle_mission || 'Mission sans titre'}</h1>
            <p className="text-gray-500">Code mission: {mission.code_mission || 'N/A'}</p>
          </div>
          <div className="ml-auto">
            {getStatusBadge(mission.statut)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informations générales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Informations générales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Client</label>
                <p className="text-gray-800">{mission.client || 'Non spécifié'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Date de début</label>
                  <p className="text-gray-800">{formatDate(mission.date_debut)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Date de fin</label>
                  <p className="text-gray-800">{formatDate(mission.date_fin)}</p>
                </div>
              </div>
              {mission.duree && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Durée</label>
                  <div className="flex items-center gap-2 text-gray-800">
                    <Clock className="h-4 w-4" />
                    {mission.duree}
                  </div>
                </div>
              )}
              {mission.demandeur && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Demandeur</label>
                  <div className="flex items-center gap-2 text-gray-800">
                    <User className="h-4 w-4" />
                    {mission.demandeur}
                  </div>
                </div>
              )}
              {mission.lieu && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Lieu</label>
                  <div className="flex items-center gap-2 text-gray-800">
                    <MapPin className="h-4 w-4" />
                    {mission.lieu}
                  </div>
                </div>
              )}
              {mission.type_mission && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Type de mission</label>
                  <p className="text-gray-800">{mission.type_mission}</p>
                </div>
              )}
              {mission.priorite && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Priorité</label>
                  <Badge variant="outline">{mission.priorite}</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informations financières */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Informations financières
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mission.budget && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Budget</label>
                  <p className="text-gray-800">{mission.budget.toLocaleString('fr-FR')} €</p>
                </div>
              )}
              {mission.frais_prevus && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Frais prévus</label>
                  <p className="text-gray-800">{mission.frais_prevus.toLocaleString('fr-FR')} €</p>
                </div>
              )}
              {!mission.budget && !mission.frais_prevus && (
                <p className="text-gray-500 italic">Aucune information financière disponible</p>
              )}
            </CardContent>
          </Card>

          {/* Contact client */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Contact client
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mission.contact_client && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Nom du contact</label>
                  <div className="flex items-center gap-2 text-gray-800">
                    <User className="h-4 w-4" />
                    {mission.contact_client}
                  </div>
                </div>
              )}
              {mission.telephone_contact && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Téléphone</label>
                  <div className="flex items-center gap-2 text-gray-800">
                    <Phone className="h-4 w-4" />
                    {mission.telephone_contact}
                  </div>
                </div>
              )}
              {mission.email_contact && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <div className="flex items-center gap-2 text-gray-800">
                    <Mail className="h-4 w-4" />
                    {mission.email_contact}
                  </div>
                </div>
              )}
              {!mission.contact_client && !mission.telephone_contact && !mission.email_contact && (
                <p className="text-gray-500 italic">Aucune information de contact disponible</p>
              )}
            </CardContent>
          </Card>

          {/* Validation et suivi */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Validation et suivi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mission.validation_manager && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Manager validateur</label>
                  <p className="text-gray-800">{mission.validation_manager}</p>
                </div>
              )}
              {mission.date_validation && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Date de validation</label>
                  <p className="text-gray-800">{formatDateTime(mission.date_validation)}</p>
                </div>
              )}
              {mission.motif_refus && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Motif de refus</label>
                  <p className="text-red-600">{mission.motif_refus}</p>
                </div>
              )}
              {!mission.validation_manager && !mission.date_validation && !mission.motif_refus && (
                <p className="text-gray-500 italic">Aucune information de validation disponible</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        {mission.description && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Description de la mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-800 whitespace-pre-wrap">{mission.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Objectifs */}
        {mission.objectifs && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Objectifs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-800 whitespace-pre-wrap">{mission.objectifs}</p>
            </CardContent>
          </Card>
        )}

        {/* Compétences et matériel */}
        {(mission.competences_requises || mission.materiel_necessaire) && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Compétences et matériel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mission.competences_requises && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Compétences requises</label>
                  <p className="text-gray-800 whitespace-pre-wrap">{mission.competences_requises}</p>
                </div>
              )}
              {mission.materiel_necessaire && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Matériel nécessaire</label>
                  <p className="text-gray-800 whitespace-pre-wrap">{mission.materiel_necessaire}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Commentaires */}
        {mission.commentaires && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Commentaires</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-800 whitespace-pre-wrap">{mission.commentaires}</p>
            </CardContent>
          </Card>
        )}

        {/* Informations système */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Informations système</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <label className="font-medium">ID de la mission</label>
                <p>{mission.id}</p>
              </div>
              {mission.created_at && (
                <div>
                  <label className="font-medium">Créé le</label>
                  <p>{formatDateTime(mission.created_at)}</p>
                </div>
              )}
              {mission.updated_at && (
                <div>
                  <label className="font-medium">Dernière modification</label>
                  <p>{formatDateTime(mission.updated_at)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Section pour afficher tous les autres champs de l'API */}
        {renderAllFields()}
      </div>
    </div>
  );
};

export default MissionDetails;
