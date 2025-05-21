
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
  CheckCircle, 
  XCircle,
  FileText, 
  Search,
  Download,
  Filter
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Types
interface LeaveValidation {
  id: string;
  requester: {
    id: string;
    name: string;
  };
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  hasAttachment: boolean;
}

// Données de test
const mockValidations: LeaveValidation[] = [
  { 
    id: '003', 
    requester: { id: '101', name: 'Jean Dupont' },
    type: 'Congés examens', 
    startDate: '20/05/2024', 
    endDate: '22/05/2024', 
    days: 3,
    reason: 'Session finale des examens universitaires',
    hasAttachment: true 
  },
  { 
    id: '007', 
    requester: { id: '102', name: 'Sophie Martin' },
    type: 'Congés sans solde', 
    startDate: '01/06/2024', 
    endDate: '15/06/2024', 
    days: 10,
    reason: 'Voyage personnel important',
    hasAttachment: false 
  },
  { 
    id: '009', 
    requester: { id: '103', name: 'Thomas Bernard' },
    type: 'Congés maladie', 
    startDate: '15/05/2024', 
    endDate: '19/05/2024', 
    days: 3,
    reason: 'Certificat médical fourni',
    hasAttachment: true 
  },
  { 
    id: '012', 
    requester: { id: '104', name: 'Marie Dupuis' },
    type: 'Congés légaux', 
    startDate: '10/07/2024', 
    endDate: '24/07/2024', 
    days: 10,
    reason: 'Vacances d\'été en famille',
    hasAttachment: false 
  }
];

const LeaveValidations: React.FC = () => {
  const [validations, setValidations] = useState<LeaveValidation[]>(mockValidations);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<LeaveValidation | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (type: string | null) => {
    setFilterType(type);
  };

  const handleApproveRequest = (request: LeaveValidation) => {
    // Ici, vous feriez un appel API pour approuver la demande
    setValidations(validations.filter(req => req.id !== request.id));
    toast.success(`Demande #${request.id} de ${request.requester.name} approuvée`);
  };

  const handleRejectRequest = (request: LeaveValidation) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setShowRejectDialog(true);
  };

  const confirmReject = () => {
    if (selectedRequest) {
      // Ici, vous feriez un appel API pour rejeter la demande avec la raison
      setValidations(validations.filter(req => req.id !== selectedRequest.id));
      toast.success(`Demande #${selectedRequest.id} de ${selectedRequest.requester.name} rejetée`);
      setShowRejectDialog(false);
    }
  };

  const handleDownloadAttachment = (id: string) => {
    toast.info(`Téléchargement du justificatif pour la demande #${id} (Fonctionnalité à venir)`);
  };

  const handleViewDetails = (request: LeaveValidation) => {
    toast.info(`Détails de la demande #${request.id} (Fonctionnalité à venir)`);
  };

  // Filtrer les demandes en fonction du terme de recherche et du type de filtre
  const filteredValidations = validations.filter(request => {
    const matchesSearch = 
      request.requester.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.startDate.includes(searchTerm) ||
      request.endDate.includes(searchTerm);
    
    const matchesFilter = filterType ? request.type === filterType : true;
    
    return matchesSearch && matchesFilter;
  });

  // Liste unique des types de congés pour le filtre
  const leaveTypes = Array.from(new Set(validations.map(v => v.type)));

  return (
    <div className="space-y-4">
      {/* Barre de recherche et filtre */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input 
            type="search"
            placeholder="Rechercher..." 
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex gap-2">
              <Filter className="h-4 w-4" />
              {filterType ? `Filtré: ${filterType}` : "Filtrer par type"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Types de congés</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleFilterChange(null)}>
              Tous les types
            </DropdownMenuItem>
            {leaveTypes.map((type) => (
              <DropdownMenuItem key={type} onClick={() => handleFilterChange(type)}>
                {type}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Tableau des validations */}
      <div className="border rounded-md overflow-hidden">
        {filteredValidations.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Demandeur</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Jours</TableHead>
                  <TableHead>Motif</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredValidations.map((validation) => (
                  <TableRow key={validation.id} className="admin-table-row-hover">
                    <TableCell className="font-medium">{validation.id}</TableCell>
                    <TableCell>{validation.requester.name}</TableCell>
                    <TableCell>{validation.type}</TableCell>
                    <TableCell>{`${validation.startDate} - ${validation.endDate}`}</TableCell>
                    <TableCell>{validation.days}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={validation.reason}>
                      {validation.reason}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-green-600 hover:text-green-800 hover:bg-green-50"
                          onClick={() => handleApproveRequest(validation)}
                          title="Approuver"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleRejectRequest(validation)}
                          title="Refuser"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                        {validation.hasAttachment && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleDownloadAttachment(validation.id)}
                            title="Télécharger le justificatif"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleViewDetails(validation)}
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
            <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Aucune demande à valider</h3>
            <p className="text-sm text-gray-500">
              {searchTerm || filterType 
                ? "Aucun résultat pour cette recherche" 
                : "Toutes les demandes ont été traitées"}
            </p>
          </div>
        )}
      </div>

      {/* Dialog de rejet avec motif */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refuser cette demande</DialogTitle>
            <DialogDescription>
              Veuillez fournir un motif de refus pour la demande de {selectedRequest?.requester.name}.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Motif du refus..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Annuler
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmReject}
              disabled={rejectionReason.trim().length < 3}
            >
              Confirmer le refus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeaveValidations;
