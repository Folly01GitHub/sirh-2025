
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Building2, MapPin, Phone, Mail, User, Calendar, DollarSign, Shield, FileText, Users } from 'lucide-react';
import HRISNavbar from '@/components/hris/HRISNavbar';
import apiClient from '@/utils/apiClient';

interface Contact {
  name: string;
  function: string;
  email: string;
  phone: string;
}

interface Validations {
  procedures: boolean;
  kyc: boolean;
  mandate_renewal_yes: boolean;
}

interface MissionDetails {
  id: string;
  code_mission: string;
  title: string;
  client: string;
  country: string;
  client_address: string;
  public_entity: boolean;
  referred: boolean;
  confidentiality_contract: boolean;
  activity_sectors: string;
  taxation_regime: string;
  taxpayer_account: string;
  department: string;
  start_date: string;
  end_date: string;
  budget: number;
  currency: string;
  subcontracting_budget: number;
  subcontracting_currency: string;
  disbursements: number;
  signatory_partner: string;
  client_manager: string;
  mission_chief: string;
  contacts: Contact[];
  validations: Validations;
}

const fetchMissionDetails = async (id: string): Promise<MissionDetails> => {
  const response = await apiClient.get(`/demande-mission/${id}`);
  console.log('API Response for mission details:', response.data);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${amount?.toLocaleString('fr-FR')} ${currency}`;
  };

  const formatBoolean = (value: boolean) => {
    return value ? 'Oui' : 'Non';
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
            <Button onClick={handleGoBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux missions
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
        <div className="flex items-center gap-4 mb-6">
          <Button onClick={handleGoBack} variant="back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{mission.title}</h1>
            <p className="text-gray-500">Code mission : {mission.code_mission}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informations générales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informations générales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Client</label>
                <p className="text-gray-800">{mission.client}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Pays</label>
                <p className="text-gray-800">{mission.country}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Adresse géographique client</label>
                <div className="flex items-center gap-2 text-gray-800">
                  <MapPin className="h-4 w-4" />
                  {mission.client_address}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Département</label>
                <p className="text-gray-800">{mission.department}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Date de début</label>
                  <div className="flex items-center gap-2 text-gray-800">
                    <Calendar className="h-4 w-4" />
                    {formatDate(mission.start_date)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Date de fin</label>
                  <div className="flex items-center gap-2 text-gray-800">
                    <Calendar className="h-4 w-4" />
                    {formatDate(mission.end_date)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations client */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Informations client
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Entité d'Intérêt Public</label>
                <p className="text-gray-800">{formatBoolean(mission.public_entity)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Référé</label>
                <p className="text-gray-800">{formatBoolean(mission.referred)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Client sous contrat de confidentialité</label>
                <p className="text-gray-800">{formatBoolean(mission.confidentiality_contract)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Secteurs d'activités</label>
                <p className="text-gray-800">{mission.activity_sectors}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Régime d'Imposition</label>
                <p className="text-gray-800">{mission.taxation_regime}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Compte contribuable</label>
                <p className="text-gray-800">{mission.taxpayer_account}</p>
              </div>
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
              <div>
                <label className="text-sm font-medium text-gray-600">Budget HT</label>
                <p className="text-gray-800">{formatCurrency(mission.budget, mission.currency)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Budget sous-traitance HT</label>
                <p className="text-gray-800">{formatCurrency(mission.subcontracting_budget, mission.subcontracting_currency)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Estimation des débours</label>
                <p className="text-gray-800">{mission.disbursements?.toLocaleString('fr-FR')} €</p>
              </div>
            </CardContent>
          </Card>

          {/* Équipe */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Équipe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Associé signataire</label>
                <div className="flex items-center gap-2 text-gray-800">
                  <User className="h-4 w-4" />
                  {mission.signatory_partner}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Responsable client</label>
                <div className="flex items-center gap-2 text-gray-800">
                  <User className="h-4 w-4" />
                  {mission.client_manager}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Intervenant (Chef de mission)</label>
                <div className="flex items-center gap-2 text-gray-800">
                  <User className="h-4 w-4" />
                  {mission.mission_chief}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contacts - Display variable number of contacts */}
          {mission.contacts && mission.contacts.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contacts ({mission.contacts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mission.contacts.map((contact, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-2">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Nom complet</label>
                        <p className="text-gray-800 font-medium">{contact.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Fonction</label>
                        <p className="text-gray-800">{contact.function}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Email</label>
                        <div className="flex items-center gap-2 text-gray-800">
                          <Mail className="h-4 w-4" />
                          {contact.email}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Téléphone</label>
                        <div className="flex items-center gap-2 text-gray-800">
                          <Phone className="h-4 w-4" />
                          {contact.phone}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Validations */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Validations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Procédures d'acceptation effectuées</label>
                  <p className="text-gray-800">{formatBoolean(mission.validations.procedures)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">QAM/KYC/LBC-FT à jour</label>
                  <p className="text-gray-800">{formatBoolean(mission.validations.kyc)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">S'agit-il de l'année de renouvellement du mandat ?</label>
                  <p className="text-gray-800">{formatBoolean(mission.validations.mandate_renewal_yes)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MissionDetails;
