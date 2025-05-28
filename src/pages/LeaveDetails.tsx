
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Clock, User, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import HRISNavbar from '@/components/hris/HRISNavbar';

interface LeaveDetailsData {
  id: string;
  demandeur?: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: string;
  reason?: string;
  commentaire_rh?: string;
  isLegal: boolean;
  requester?: string;
}

const LeaveDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  console.log('LeaveDetails - ID from URL:', id);

  // Get cached data from both possible sources
  const myLeavesData = queryClient.getQueryData(['leaves', 'self']) as any[];
  const teamLeavesData = queryClient.getQueryData(['leaves', 'team']) as any[];
  
  console.log('LeaveDetails - My leaves cache:', myLeavesData);
  console.log('LeaveDetails - Team leaves cache:', teamLeavesData);

  // Find the leave request in cached data
  let leaveDetails: LeaveDetailsData | null = null;
  
  if (myLeavesData) {
    const foundInMyLeaves = myLeavesData.find((leave: any) => leave.id === id);
    if (foundInMyLeaves) {
      leaveDetails = {
        id: foundInMyLeaves.id,
        type: foundInMyLeaves.type,
        startDate: foundInMyLeaves.startDate,
        endDate: foundInMyLeaves.endDate,
        days: foundInMyLeaves.days,
        status: foundInMyLeaves.status,
        reason: foundInMyLeaves.reason,
        isLegal: foundInMyLeaves.isLegal
      };
      console.log('LeaveDetails - Found in my leaves:', leaveDetails);
    }
  }
  
  if (!leaveDetails && teamLeavesData) {
    const foundInTeamLeaves = teamLeavesData.find((leave: any) => leave.id === id);
    if (foundInTeamLeaves) {
      leaveDetails = {
        id: foundInTeamLeaves.id,
        demandeur: foundInTeamLeaves.requester,
        type: foundInTeamLeaves.type,
        startDate: foundInTeamLeaves.startDate,
        endDate: foundInTeamLeaves.endDate,
        days: foundInTeamLeaves.days,
        status: foundInTeamLeaves.status,
        reason: foundInTeamLeaves.reason,
        isLegal: foundInTeamLeaves.isLegal
      };
      console.log('LeaveDetails - Found in team leaves:', leaveDetails);
    }
  }

  console.log('LeaveDetails - Final leave details:', leaveDetails);

  const handleBack = () => {
    navigate('/leave');
  };

  const handleDownloadAttachment = () => {
    console.log(`Téléchargement du justificatif pour la demande #${id}`);
    // Logique de téléchargement à implémenter
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
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Acceptée</Badge>;
      case 'Refusée':
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Refusée</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">En attente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // If no leave details found in cache, show error
  if (!leaveDetails) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f8f9fc]">
        <HRISNavbar />
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
          <Button
            variant="ghost"
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
          variant="ghost"
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
                    Demande de congé #{leaveDetails.id}
                  </CardTitle>
                  {leaveDetails.demandeur && (
                    <p className="text-gray-600 mt-1">
                      Demandeur: {leaveDetails.demandeur}
                    </p>
                  )}
                </div>
                {renderStatusBadge(leaveDetails.status)}
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
                  <p className="text-gray-800">{leaveDetails.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Date de début</label>
                  <p className="text-gray-800">{leaveDetails.startDate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Date de fin</label>
                  <p className="text-gray-800">{leaveDetails.endDate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Nombre de jours</label>
                  <p className="text-gray-800 font-semibold">{leaveDetails.days} jours</p>
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
                {leaveDetails.reason && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Motif</label>
                    <p className="text-gray-800">{leaveDetails.reason}</p>
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadAttachment}
                      className="mt-2"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger le justificatif
                    </Button>
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
