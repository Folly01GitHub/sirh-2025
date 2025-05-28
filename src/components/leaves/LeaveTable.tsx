
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Edit, 
  Trash2,
  Download,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';

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
}

interface LeaveTableProps {
  leaves: LeaveItem[];
  isLoading: boolean;
  activeFilter: string;
  onActionClick: (id: string, action: string) => void;
}

const LeaveTable: React.FC<LeaveTableProps> = ({ 
  leaves, 
  isLoading, 
  activeFilter,
  onActionClick 
}) => {
  const navigate = useNavigate();

  const handleViewDetails = (id: string) => {
    navigate(`/leave/${id}`);
  };

  const handleEditRequest = (request: LeaveItem) => {
    toast.info(`Modification de la demande #${request.id} (Fonctionnalité à venir)`);
  };

  const handleDeleteRequest = (request: LeaveItem) => {
    toast.info(`Suppression de la demande #${request.id} (Fonctionnalité à venir)`);
  };

  const handleDownloadAttachment = (id: string) => {
    toast.info(`Téléchargement du justificatif pour la demande #${id} (Fonctionnalité à venir)`);
  };

  const handleApproveRequest = (request: LeaveItem) => {
    onActionClick(request.id, 'approve');
    toast.success(`Demande #${request.id} approuvée`);
  };

  const handleRejectRequest = (request: LeaveItem) => {
    onActionClick(request.id, 'reject');
    toast.success(`Demande #${request.id} rejetée`);
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
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Validé</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">En attente</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Rejeté</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {leaves.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                {activeFilter === 'team' && <TableHead>Demandeur</TableHead>}
                <TableHead>Type</TableHead>
                <TableHead>Période</TableHead>
                <TableHead>Jours</TableHead>
                {activeFilter === 'team' && <TableHead>Statut</TableHead>}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaves.map((leave) => (
                <TableRow key={leave.id} className="hover:bg-gray-50 cursor-pointer">
                  <TableCell className="font-medium">{leave.id}</TableCell>
                  {activeFilter === 'team' && (
                    <TableCell>{leave.requester}</TableCell>
                  )}
                  <TableCell>{leave.type}</TableCell>
                  <TableCell>{`${leave.startDate} - ${leave.endDate}`}</TableCell>
                  <TableCell>{leave.days}</TableCell>
                  {activeFilter === 'team' && (
                    <TableCell>{renderStatusBadge(leave.status)}</TableCell>
                  )}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {activeFilter === 'team' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-green-600 hover:text-green-800 hover:bg-green-50"
                            onClick={() => handleApproveRequest(leave)}
                            title="Approuver"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleRejectRequest(leave)}
                            title="Refuser"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      
                      {leave.hasAttachment && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleDownloadAttachment(leave.id)}
                          title="Télécharger le justificatif"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {activeFilter === 'self' && leave.status === 'pending' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleEditRequest(leave)}
                            title="Modifier la demande"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleDeleteRequest(leave)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            title="Annuler la demande"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleViewDetails(leave.id)}
                        title="Voir les détails"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="py-8 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Aucune demande trouvée</h3>
          <p className="text-sm text-gray-500">
            {activeFilter === 'self' 
              ? "Vous n'avez pas encore soumis de demande de congés"
              : "Aucune demande en attente de validation"}
          </p>
        </div>
      )}
    </div>
  );
};

export default LeaveTable;
