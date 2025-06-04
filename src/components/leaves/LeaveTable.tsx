import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Trash2, Download, CheckCircle, XCircle, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import apiClient from '@/utils/apiClient';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface LeaveItem {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: 'approved' | 'pending' | 'rejected' | 'Niveau responsable' | 'Niveau RH' | 'Annulée' | 'Acceptée' | 'Refusée';
  hasAttachment: boolean;
  requester?: string;
  reason?: string;
  isLegal?: boolean;
  isValidation?: boolean;
}

interface LeaveTableProps {
  leaves: LeaveItem[];
  isLoading: boolean;
  activeFilter: string;
  onActionClick: (id: string, action: string) => void;
}

const LeaveTable = ({ leaves, isLoading, activeFilter, onActionClick }: LeaveTableProps) => {
  const navigate = useNavigate();
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState<string>('');

  const handleDelete = (id: string) => {
    onActionClick(id, 'delete');
    toast.success(`Demande #${id} supprimée`);
  };

  const handleDownload = async (id: string) => {
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

  const handleView = (id: string) => {
    navigate(`/leave-details/${id}`);
  };

  const handleApprove = async (id: string) => {
    if (activeFilter === 'team') {
      try {
        await apiClient.patch(`/demandes-conges/${id}/valider`);
        toast.success(`Demande #${id} approuvée`);
        onActionClick(id, 'approve');
      } catch (error) {
        console.error('Erreur lors de l\'approbation de la demande:', error);
        toast.error('Erreur lors de l\'approbation de la demande');
      }
    } else {
      onActionClick(id, 'approve');
      toast.success(`Demande #${id} approuvée`);
    }
  };

  const handleReject = async (id: string) => {
    if (activeFilter === 'team') {
      try {
        await apiClient.patch(`/demandes-conges/${id}/rejeter`, {
          motif: rejectionReason
        });
        toast.success(`Demande #${id} rejetée`);
        onActionClick(id, 'reject');
        setIsRejectDialogOpen(false);
        setRejectionReason('');
        setSelectedLeaveId('');
      } catch (error) {
        console.error('Erreur lors du rejet de la demande:', error);
        toast.error('Erreur lors du rejet de la demande');
      }
    } else {
      onActionClick(id, 'reject');
      toast.success(`Demande #${id} rejetée`);
    }
  };

  const handleCancel = async (id: string) => {
    if (activeFilter === 'team') {
      try {
        await apiClient.patch(`/demandes-conges/${id}/annuler`);
        toast.success(`Demande #${id} annulée`);
        onActionClick(id, 'cancel');
      } catch (error) {
        console.error('Erreur lors de l\'annulation de la demande:', error);
        toast.error('Erreur lors de l\'annulation de la demande');
      }
    } else {
      onActionClick(id, 'cancel');
      toast.success(`Demande #${id} annulée`);
    }
  };

  const openRejectDialog = (id: string) => {
    setSelectedLeaveId(id);
    setRejectionReason('');
    setIsRejectDialogOpen(true);
  };

  const confirmReject = () => {
    if (selectedLeaveId && rejectionReason.trim()) {
      handleReject(selectedLeaveId);
    }
  };

  const renderStatusBadge = (status: string) => {
    if (activeFilter === 'self') {
      // For "Mes congés" section, display raw status with color coding
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
    } else {
      // For "Congés à valider" section, keep existing logic
      switch (status) {
        case 'approved':
        case 'Acceptée':
          return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Acceptée</Badge>;
        case 'pending':
          return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">En attente</Badge>;
        case 'rejected':
        case 'Refusée':
          return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Refusée</Badge>;
        case 'Niveau responsable':
          return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Niveau responsable</Badge>;
        case 'Niveau RH':
          return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Niveau RH</Badge>;
        case 'Annulée':
          return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Annulée</Badge>;
        default:
          return <Badge variant="outline">Inconnu</Badge>;
      }
    }
  };

  const canShowActionButtons = (status: string) => {
    // For team section, hide action buttons for final statuses
    if (activeFilter === 'team') {
      return !['Acceptée', 'Refusée', 'Annulée'].includes(status);
    }
    return true;
  };

  const canShowCancelButton = (status: string) => {
    // For team section, only show cancel button for "Niveau responsable" status
    if (activeFilter === 'team') {
      return status === 'Niveau responsable';
    }
    return true;
  };

  const canShowApprovalButtons = (status: string, isValidation?: boolean) => {
    // For team section, only show approval/rejection buttons when isValidation is true
    if (activeFilter === 'team') {
      return isValidation === true && !['Acceptée', 'Refusée', 'Annulée'].includes(status);
    }
    return true;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {activeFilter === 'team' && <TableHead>Demandeur</TableHead>}
            <TableHead>Date de début</TableHead>
            <TableHead>Date de fin</TableHead>
            <TableHead>Jours pris</TableHead>
            {activeFilter === 'self' && <TableHead>Statut</TableHead>}
            {activeFilter === 'team' && <TableHead>Statut</TableHead>}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                {activeFilter === 'team' && <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>}
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                {(activeFilter === 'self' || activeFilter === 'team') && <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>}
                <TableCell className="text-right"><Skeleton className="h-4 w-[100px]" /></TableCell>
              </TableRow>
            ))
          ) : leaves.length === 0 ? (
            <TableRow>
              <TableCell colSpan={activeFilter === 'team' ? 6 : 5} className="text-center py-6">
                Aucune demande de congé trouvée.
              </TableCell>
            </TableRow>
          ) : (
            leaves.map((leave) => (
              <TableRow key={leave.id}>
                {activeFilter === 'team' && <TableCell>{leave.requester}</TableCell>}
                <TableCell>{leave.startDate}</TableCell>
                <TableCell>{leave.endDate}</TableCell>
                <TableCell>{leave.days}</TableCell>
                {activeFilter === 'self' && <TableCell>{renderStatusBadge(leave.status)}</TableCell>}
                {activeFilter === 'team' && <TableCell>{renderStatusBadge(leave.status)}</TableCell>}
                <TableCell className="text-right space-x-2">
                  {activeFilter === 'self' ? (
                    <>
                      {leave.isLegal === false && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownload(leave.id)}
                          title="Télécharger justificatif"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleView(leave.id)}
                        title="Voir les détails"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      {leave.isLegal === false && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownload(leave.id)}
                          title="Télécharger justificatif"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      {canShowActionButtons(leave.status) && (
                        <>
                          {canShowCancelButton(leave.status) && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                  title="Annuler la demande"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmer l'annulation</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Êtes-vous sûr de vouloir annuler cette demande de congé ? Cette action ne peut pas être annulée.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleCancel(leave.id)}>
                                    Confirmer l'annulation
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                          {canShowApprovalButtons(leave.status, leave.isValidation) && (
                            <>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-green-600 hover:text-green-800 hover:bg-green-50"
                                    title="Valider"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmer l'approbation</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Êtes-vous sûr de vouloir approuver cette demande de congé ?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleApprove(leave.id)}>
                                      Approuver
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                              
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openRejectDialog(leave.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                title="Refuser"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleView(leave.id)}
                        title="Voir les détails"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Dialog de refus avec motif */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refuser la demande de congé</DialogTitle>
            <DialogDescription>
              Veuillez fournir un motif pour le refus de cette demande.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Motif du refus..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmReject}
              disabled={!rejectionReason.trim()}
            >
              Refuser la demande
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeaveTable;
