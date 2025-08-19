import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/utils/apiClient';
import MissionConfirmationDialog from './MissionConfirmationDialog';
import { useAuth } from '@/contexts/AuthContext';

interface MissionItem {
  id: string;
  code: string;
  title: string;
  client: string;
  startDate: string;
  endDate: string;
  status: 'validated' | 'pending' | 'rejected' | 'en_attente' | 'validee' | 'refusee';
  requester?: string;
}

interface MissionTableProps {
  missions: MissionItem[];
  isLoading: boolean;
  activeFilter: string;
  onActionClick: (id: string, action: string) => void;
  isAcceptationPage?: boolean;
}

const MissionTable = ({ missions, isLoading, activeFilter, onActionClick, isAcceptationPage = false }: MissionTableProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    action: 'approve' | 'reject';
    missionId: string;
    missionTitle: string;
  }>({
    isOpen: false,
    action: 'approve',
    missionId: '',
    missionTitle: ''
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutation pour valider une mission
  const validateMissionMutation = useMutation({
    mutationFn: async (missionId: string) => {
      const endpoint = isAcceptationPage ? `/acceptation/${missionId}/approuver` : `/missions/${missionId}/valider`;
      const response = await apiClient.post(endpoint);
      return response.data;
    },
    onSuccess: () => {
      // Rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['missions', activeFilter] });
      queryClient.invalidateQueries({ queryKey: ['missionStats', activeFilter] });
      
      toast({
        title: 'Mission validée',
        description: 'La mission a été validée avec succès.',
      });
    },
    onError: (error: any) => {
      console.error('Erreur lors de la validation:', error);
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Erreur lors de la validation de la mission.',
        variant: 'destructive',
      });
    }
  });

  // Mutation pour refuser une mission
  const rejectMissionMutation = useMutation({
    mutationFn: async (missionId: string) => {
      const endpoint = isAcceptationPage ? `/acceptation/${missionId}/refuser` : `/missions/${missionId}/refuser`;
      const response = await apiClient.post(endpoint);
      return response.data;
    },
    onSuccess: () => {
      // Rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['missions', activeFilter] });
      queryClient.invalidateQueries({ queryKey: ['missionStats', activeFilter] });
      
      toast({
        title: 'Mission refusée',
        description: 'La mission a été refusée avec succès.',
      });
    },
    onError: (error: any) => {
      console.error('Erreur lors du refus:', error);
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Erreur lors du refus de la mission.',
        variant: 'destructive',
      });
    }
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
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const handleActionClick = (missionId: string, action: 'approve' | 'reject', missionTitle: string) => {
    setConfirmDialog({
      isOpen: true,
      action,
      missionId,
      missionTitle
    });
  };

  const handleConfirmAction = () => {
    const { action, missionId } = confirmDialog;
    
    // Appeler la mutation appropriée
    if (action === 'approve') {
      validateMissionMutation.mutate(missionId);
    } else {
      rejectMissionMutation.mutate(missionId);
    }
    
    // Fermer la dialog
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
  };

  const handleViewDetails = (missionId: string) => {
    navigate(`/missions/${missionId}`);
  };

  // Function to check if mission is pending
  const isMissionPending = (status: string) => {
    if (isAcceptationPage) {
      // Pour la page d'acceptation, afficher les boutons pour tous les statuts sauf "Approuvée", "Refusée" et "Annulée"
      const excludedStatuses = ['Approuvée', 'Refusée', 'Annulée', 'validated', 'validee', 'rejected', 'refusee'];
      return !excludedStatuses.includes(status);
    }
    // Pour les autres pages, logique existante
    return status === 'en_attente' || status === 'En attente' || status === 'pending' || status === 'Niveau QRM' || status === 'Niveau comptable';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!missions || missions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500">Aucune mission trouvée</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code mission</TableHead>
              <TableHead>Libellé mission</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Date de début</TableHead>
              <TableHead>Date de fin</TableHead>
              {activeFilter === 'team' && <TableHead>Demandeur</TableHead>}
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {missions.map((mission) => (
              <TableRow key={mission.id}>
                <TableCell className="font-medium">{mission.code}</TableCell>
                <TableCell>{mission.title}</TableCell>
                <TableCell>{mission.client}</TableCell>
                <TableCell>{formatDate(mission.startDate)}</TableCell>
                <TableCell>{formatDate(mission.endDate)}</TableCell>
                {activeFilter === 'team' && <TableCell>{mission.requester}</TableCell>}
                <TableCell>{getStatusBadge(mission.status)}</TableCell>
                <TableCell>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      {activeFilter === 'team' && isMissionPending(mission.status) && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-600 hover:text-green-800 hover:bg-green-50"
                            onClick={() => handleActionClick(mission.id, 'approve', mission.title)}
                            disabled={validateMissionMutation.isPending || rejectMissionMutation.isPending}
                            title="Valider"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                           {user?.role !== 'comptable' && (
                             <Button
                               variant="ghost"
                               size="icon"
                               className="text-red-600 hover:text-red-800 hover:bg-red-50"
                               onClick={() => handleActionClick(mission.id, 'reject', mission.title)}
                               disabled={validateMissionMutation.isPending || rejectMissionMutation.isPending}
                               title="Refuser"
                             >
                               <XCircle className="h-4 w-4" />
                             </Button>
                           )}
                        </>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewDetails(mission.id)}
                      title="Voir les détails"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <MissionConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, isOpen: open }))}
        onConfirm={handleConfirmAction}
        action={confirmDialog.action}
        missionTitle={confirmDialog.missionTitle}
      />
    </>
  );
};

export default MissionTable;
