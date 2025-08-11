import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Clock, User, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import HRISNavbar from '@/components/hris/HRISNavbar';
import apiClient from '@/utils/apiClient';
import { toast } from 'sonner';

interface LeaveDetailsData {
  id: string;
  demandeur?: string;
  approbateur?: string;
  type: string;
  date_debut: string;
  date_fin: string;
  jours_pris: number;
  statut: string;
  motif?: string;
  commentaire_rh?: string;
  isLegal: boolean;
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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: leaveDetails,
    isLoading,
    error
  } = useQuery({
    queryKey: ['leaveDetails', id],
    queryFn: () => fetchLeaveDetails(id!),
    enabled: !!id
  });

  const handleBack = () => {
    navigate(-1);
  };

  const handleDownloadAttachment = async () => {
    if (!id) return;
    
    try {
      console.log(`Téléchargement du justificatif pour la demande #${id}`);
      
      const response = await apiClient.get(`/justificatif/${id}`, {
        responseType: 'blob'
      });
      
      // Create blob URL with original content type
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      
      // Get filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = `justificatif_${id}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }
      
      // Create download link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(`Justificatif téléchargé avec succès`);
    } catch (error) {
      console.error('Erreur lors du téléchargement du justificatif:', error);
      toast.error('Erreur lors du téléchargement du justificatif');
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
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f8f9fc]">
        <HRISNavbar />
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !leaveDetails) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f8f9fc]">
        <HRISNavbar />
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
          <Button
            variant="back"
            onClick={handleBack}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux congés
          </Button>
          <Card>
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Demande introuvable</h2>
              <p className="text-gray-600">La demande de congé demandée n'a pas pu être trouvée.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fc]">
      <HRISNavbar />
      
      <div className="container mx-auto p-4 md:p-6 lg:p-8 animate-fade-in">
        <Button
          variant="back"
          onClick={handleBack}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux congés
        </Button>

        <div className="grid gap-6">
          {/* En-tête */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-800">
                    Demande de congé
                  </CardTitle>
                  {leaveDetails.demandeur && (
                    <p className="text-gray-600 mt-1">
                      Demandeur: {leaveDetails.demandeur}
                    </p>
                  )}
                  {leaveDetails.approbateur && (
                    <p className="text-gray-600 mt-1">
                      Responsable: {leaveDetails.approbateur}
                    </p>
                  )}
                </div>
                {renderStatusBadge(leaveDetails.statut)}
              </div>
            </CardHeader>
          </Card>

          {/* Détails de la demande */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Informations sur la période
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Type de congé</label>
                  <p className="text-gray-800">
                    {leaveDetails.isLegal ? 'Congés légaux' : 'Congés sans solde'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Date de début</label>
                  <p className="text-gray-800">{leaveDetails.date_debut}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Date de reprise</label>
                  <p className="text-gray-800">{leaveDetails.date_fin}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Nombre de jours</label>
                  <p className="text-gray-800 font-semibold">{leaveDetails.jours_pris} jours</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Détails complémentaires
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {leaveDetails.motif && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Motif</label>
                    <p className="text-gray-800">{leaveDetails.motif}</p>
                  </div>
                )}
                {leaveDetails.commentaire_rh && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Commentaire RH</label>
                    <p className="text-gray-800">{leaveDetails.commentaire_rh}</p>
                  </div>
                )}
                {!leaveDetails.isLegal && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Justificatif</label>
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadAttachment}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Télécharger le justificatif
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveDetails;
