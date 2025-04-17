
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Card, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  Info, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Trash2 
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface Permission {
  id: string;
  request_date: string;
  permission_date: string;
  start_time: string;
  end_time: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  validation_level: number;
  rejection_reason?: string;
  updated_at: string;
}

const PermissionRequests = () => {
  const { user } = useAuth();
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: permissions, isLoading, isError, refetch } = useQuery({
    queryKey: ['permissionsInCurrent'],
    queryFn: async () => {
      const response = await axios.get('http://backend.local.com/api/permissions_in_current', {
        headers: {
          'Authorization': `Bearer ${user?.token || ''}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    },
  });

  const handleCardClick = (permission: Permission) => {
    setSelectedPermission(permission);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCancelRequest = async () => {
    if (!selectedPermission) return;
    
    setIsDeleting(true);
    try {
      await axios.delete(`http://backend.local.com/api/permissions/${selectedPermission.id}`, {
        headers: {
          'Authorization': `Bearer ${user?.token || ''}`,
          'Content-Type': 'application/json',
        },
      });
      
      toast.success('Demande annulée avec succès', {
        description: 'Votre demande de permission a été annulée.',
      });
      
      setIsModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Error canceling permission:', error);
      toast.error('Échec de l\'annulation', {
        description: 'Impossible d\'annuler cette demande. Veuillez réessayer.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]">En attente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-[#10B981]/10 text-[#10B981] border-[#10B981]">Approuvée</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]">Rejetée</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="shadow-md">
            <CardContent className="p-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 justify-between">
              <Skeleton className="h-6 w-1/3" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 p-4 rounded-lg border border-red-200 flex items-center gap-3">
        <AlertCircle className="text-red-500 h-5 w-5" />
        <p className="text-red-700">
          Impossible de charger vos demandes. Veuillez actualiser la page ou réessayer plus tard.
        </p>
      </div>
    );
  }

  if (permissions?.length === 0) {
    return (
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 flex items-center gap-3">
        <Info className="text-blue-500 h-5 w-5" />
        <p className="text-blue-700">
          Vous n'avez aucune demande de permission active pour le moment.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {permissions?.map((permission: Permission) => (
          <Card 
            key={permission.id} 
            className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer"
            onClick={() => handleCardClick(permission)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-[#2563EB]" />
                <span className="text-sm font-medium">
                  {format(new Date(permission.permission_date), 'PPP', { locale: fr })}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-[#2563EB]" />
                <span className="text-sm">
                  {permission.start_time} - {permission.end_time}
                </span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                {permission.reason.length > 40 
                  ? `${permission.reason.substring(0, 40)}...` 
                  : permission.reason}
              </p>
            </CardContent>
            <CardFooter className="p-4 pt-0 justify-between border-t border-gray-100 mt-2">
              {getStatusBadge(permission.status)}
              <span className="text-xs text-gray-500">
                {format(new Date(permission.request_date), 'dd/MM/yyyy')}
              </span>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Détails de la permission</DialogTitle>
          </DialogHeader>
          
          {selectedPermission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Date de demande</p>
                  <p>{format(new Date(selectedPermission.request_date), 'PPP', { locale: fr })}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Date de permission</p>
                  <p>{format(new Date(selectedPermission.permission_date), 'PPP', { locale: fr })}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Heure de départ</p>
                  <p>{selectedPermission.start_time}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Heure de retour</p>
                  <p>{selectedPermission.end_time}</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Statut</p>
                <div className="flex items-center gap-2">
                  {selectedPermission.status === 'pending' && (
                    <><Clock className="h-4 w-4 text-[#F59E0B]" /> En attente</>
                  )}
                  {selectedPermission.status === 'approved' && (
                    <><CheckCircle2 className="h-4 w-4 text-[#10B981]" /> Approuvée</>
                  )}
                  {selectedPermission.status === 'rejected' && (
                    <><XCircle className="h-4 w-4 text-[#EF4444]" /> Rejetée</>
                  )}
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Motif</p>
                <p className="text-sm">{selectedPermission.reason}</p>
              </div>
              
              {selectedPermission.status === 'rejected' && selectedPermission.rejection_reason && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Motif du rejet</p>
                  <p className="text-sm text-red-600">{selectedPermission.rejection_reason}</p>
                </div>
              )}
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Dernière mise à jour</p>
                <p className="text-sm">{format(new Date(selectedPermission.updated_at), 'PPP à HH:mm', { locale: fr })}</p>
              </div>
            </div>
          )}
          
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={handleCloseModal}>
              Fermer
            </Button>
            
            {selectedPermission && selectedPermission.status === 'pending' && (
              <Button 
                variant="destructive" 
                onClick={handleCancelRequest}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Annulation...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Annuler la demande
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PermissionRequests;
