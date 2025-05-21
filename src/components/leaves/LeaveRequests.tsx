
import React, { useState } from 'react';
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
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

// Types
interface LeaveRequest {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: 'approved' | 'pending' | 'rejected';
  hasAttachment: boolean;
}

// Données de test
const mockLeaveRequests: LeaveRequest[] = [
  { 
    id: '001', 
    type: 'Congés légaux', 
    startDate: '01/05/2024', 
    endDate: '10/05/2024', 
    days: 7,
    status: 'approved', 
    hasAttachment: false 
  },
  { 
    id: '002', 
    type: 'Congés sans solde', 
    startDate: '15/05/2024', 
    endDate: '18/05/2024', 
    days: 3,
    status: 'pending', 
    hasAttachment: true 
  },
  { 
    id: '003', 
    type: 'Congés maladie', 
    startDate: '20/06/2024', 
    endDate: '24/06/2024', 
    days: 3,
    status: 'rejected', 
    hasAttachment: true 
  },
  { 
    id: '004', 
    type: 'Congés exceptionnels', 
    startDate: '10/07/2024', 
    endDate: '12/07/2024',
    days: 2, 
    status: 'pending', 
    hasAttachment: true 
  }
];

const LeaveRequests: React.FC = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(mockLeaveRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleEditRequest = (request: LeaveRequest) => {
    toast.info(`Modification de la demande #${request.id} (Fonctionnalité à venir)`);
  };

  const handleDeleteRequest = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedRequest) {
      // Ici, vous feriez un appel API pour supprimer la demande
      setLeaveRequests(leaveRequests.filter(req => req.id !== selectedRequest.id));
      toast.success(`Demande #${selectedRequest.id} annulée avec succès`);
      setShowDeleteDialog(false);
    }
  };

  const handleDownloadAttachment = (id: string) => {
    toast.info(`Téléchargement du justificatif pour la demande #${id} (Fonctionnalité à venir)`);
  };

  // Filtrer les demandes en fonction du terme de recherche
  const filteredRequests = leaveRequests.filter(request =>
    request.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.startDate.includes(searchTerm) ||
    request.endDate.includes(searchTerm)
  );

  // Fonction pour rendre le badge de statut
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Validé</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">En attente</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Rejeté</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Barre de recherche */}
      <div className="relative w-full md:max-w-xs">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input 
          type="search"
          placeholder="Rechercher..." 
          value={searchTerm}
          onChange={handleSearchChange}
          className="pl-9"
        />
      </div>
      
      {/* Tableau des demandes */}
      <div className="border rounded-md overflow-hidden">
        {filteredRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Jours</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id} className="admin-table-row-hover">
                    <TableCell className="font-medium">{request.id}</TableCell>
                    <TableCell>{request.type}</TableCell>
                    <TableCell>{`${request.startDate} - ${request.endDate}`}</TableCell>
                    <TableCell>{request.days}</TableCell>
                    <TableCell>{renderStatusBadge(request.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {request.hasAttachment && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleDownloadAttachment(request.id)}
                            title="Télécharger le justificatif"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        {request.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleEditRequest(request)}
                              title="Modifier la demande"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleDeleteRequest(request)}
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
              {searchTerm ? "Aucun résultat pour cette recherche" : "Vous n'avez pas encore soumis de demande de congés"}
            </p>
          </div>
        )}
      </div>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler cette demande ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. La demande sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
            >
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LeaveRequests;
