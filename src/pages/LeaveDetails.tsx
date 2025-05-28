
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/utils/apiClient';
import HRISNavbar from '@/components/hris/HRISNavbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, Calendar, Clock, User, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface LeaveDetailsData {
  id: string;
  demandeur: string;
  type: string;
  date_debut: string;
  date_fin: string;
  jours_pris: number;
  statut: string;
  motif: string;
  isLegal: boolean;
  date_demande: string;
}

const fetchLeaveDetails = async (id: string): Promise<LeaveDetailsData> => {
  try {
    const response = await apiClient.get(`/demande-conge/${id}`);
    console.log('API Response for leave details:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching leave details:', error);
    throw error;
  }
};

const LeaveDetails = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const leaveId = searchParams.get('id');

  const { data: leaveDetails, isLoading, error } = useQuery({
    queryKey: ['leaveDetails', leaveId],
    queryFn: () => fetchLeaveDetails(leaveId!),
    enabled: !!leaveId,
  });

  const handleBack = () => {
    navigate('/leave');
  };

  const handleDownloadAttachment = () => {
    if (leaveDetails) {
      toast.info(`Téléchargement du justificatif pour la demande #${leaveDetails.id}`);
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Niveau responsable':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Niveau responsable</Badge>;
      case 'Niveau RH':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Niveau RH</Badge>;
      case 'Annulée':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Annulée</Badge>;
      case 'Acceptée':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Acceptée</Badge>;
      case 'Refusée':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Refusée</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Acceptée</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">En attente</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Refusée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!leaveId) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f8f9fc]">
        <HRISNavbar />
        <div className="container mx-auto p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Demande introuvable</h1>
            <p className="text-gray-500 mb-6">L'identifiant de la demande est manquant.</p>
            <Button onClick={handleBack}>Retour à la gestion des congés</Button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f8f9fc]">
        <HRISNavbar />
        <div className="container mx-auto p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Erreur</h1>
            <p className="text-gray-500 mb-6">Impossible de charger les détails de la demande.</p>
            <Button onClick={handleBack}>Retour à la gestion des congés</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fc]">
      <HRISNavbar />
      
      <div className="container mx-auto p-4 md:p-6 lg:p-8 animate-fade-in">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Détails de la demande #{leaveId}
            </h1>
            <p className="text-gray-500">Consultation des informations de la demande de congé</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          </div>
        ) : leaveDetails ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Informations générales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Demandeur</label>
                  <p className="text-gray-800">{leaveDetails.demandeur}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Type de congé</label>
                  <p className="text-gray-800">{leaveDetails.isLegal ? 'Congés légaux' : 'Congés sans solde'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Statut</label>
                  <div className="mt-1">
                    {renderStatusBadge(leaveDetails.statut)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date de demande</label>
                  <p className="text-gray-800">{leaveDetails.date_demande || 'Non spécifiée'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Période et durée
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Date de début</label>
                  <p className="text-gray-800">{leaveDetails.date_debut}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date de fin</label>
                  <p className="text-gray-800">{leaveDetails.date_fin}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Nombre de jours</label>
                  <p className="text-gray-800 font-semibold">{leaveDetails.jours_pris} jour(s)</p>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Motif et justificatifs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Motif de la demande</label>
                  <p className="text-gray-800 mt-2 p-3 bg-gray-50 rounded-md">
                    {leaveDetails.motif || 'Aucun motif spécifié'}
                  </p>
                </div>
                {!leaveDetails.isLegal && (
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-md border border-blue-200">
                    <div>
                      <p className="text-sm font-medium text-blue-800">Justificatif requis</p>
                      <p className="text-sm text-blue-600">Un document justificatif est disponible pour cette demande</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadAttachment}
                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default LeaveDetails;
