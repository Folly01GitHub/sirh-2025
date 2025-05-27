import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Trash2, Download, CheckCircle, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface LeaveItem {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: string;
  hasAttachment: boolean;
  requester?: string;
  reason?: string;
}

interface LeaveTableProps {
  leaves: LeaveItem[];
  isLoading: boolean;
  activeFilter: string;
  onActionClick: (id: string, action: string) => void;
}

const LeaveTable = ({ leaves, isLoading, activeFilter, onActionClick }: LeaveTableProps) => {
  const handleDelete = (id: string) => {
    onActionClick(id, 'delete');
    toast.success(`Demande #${id} supprimée`);
  };

  const handleDownload = (id: string) => {
    onActionClick(id, 'download');
    toast.info(`Téléchargement du justificatif pour la demande #${id}`);
  };

  const handleView = (id: string) => {
    onActionClick(id, 'view');
  };

  const handleApprove = (id: string) => {
    onActionClick(id, 'approve');
    toast.success(`Demande #${id} approuvée`);
  };

  const handleReject = (id: string) => {
    onActionClick(id, 'reject');
    toast.success(`Demande #${id} rejetée`);
  };

  const renderStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase();
    
    if (statusLower === 'acceptée') {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">{status}</Badge>;
    } else if (statusLower === 'niveau responsable') {
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">{status}</Badge>;
    } else if (statusLower === 'niveau rh') {
      return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">{status}</Badge>;
    } else if (statusLower === 'refusée') {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">{status}</Badge>;
    } else if (statusLower === 'annulée') {
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">{status}</Badge>;
    } else {
      return <Badge variant="outline">{status}</Badge>;
    }
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
                {activeFilter === 'self' && <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>}
                <TableCell className="text-right"><Skeleton className="h-4 w-[100px]" /></TableCell>
              </TableRow>
            ))
          ) : leaves.length === 0 ? (
            <TableRow>
              <TableCell colSpan={activeFilter === 'team' ? 5 : 5} className="text-center py-6">
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
                <TableCell className="text-right space-x-2">
                  {activeFilter === 'self' ? (
                    <>
                      {(leave.status?.toLowerCase() === 'niveau responsable' || leave.status?.toLowerCase() === 'niveau rh') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(leave.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                      {leave.hasAttachment && (
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
                      {leave.hasAttachment && (
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
                        onClick={() => handleApprove(leave.id)}
                        className="text-green-600 hover:text-green-800 hover:bg-green-50"
                        title="Valider"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleReject(leave.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        title="Refuser"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
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
    </div>
  );
};

export default LeaveTable;
