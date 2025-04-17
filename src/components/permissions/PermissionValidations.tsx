
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Card, 
  CardContent,
} from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Calendar, 
  Clock, 
  AlertCircle, 
  Loader2, 
  Info,
  CheckCircle, 
  XCircle, 
  User,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface PermissionToValidate {
  id: string;
  user: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  permission_date: string;
  start_time: string;
  end_time: string;
  reason: string;
  is_urgent: boolean;
  request_date: string;
}

const PermissionValidations = () => {
  const { user, token } = useAuth(); // Correctly access both user and token
  const queryClient = useQueryClient();
  const [selectedPermission, setSelectedPermission] = useState<PermissionToValidate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejectionMode, setIsRejectionMode] = useState(false);

  const { data: permissions, isLoading, isError } = useQuery({
    queryKey: ['permissionsToValidate'],
    queryFn: async () => {
      console.log('Using token for validation requests:', token); // Log token for debugging
      const response = await axios.get('http://backend.local.com/api/permissions_a_valider', {
        headers: {
          'Authorization': `Bearer ${token || ''}`, // Use token from AuthContext
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    },
  });

  const validateMutation = useMutation({
    mutationFn: async ({ id, action, reason }: { id: string, action: 'approve' | 'reject', reason?: string }) => {
      return axios.patch(`http://backend.local.com/api/permissions/${id}/validate`, {
        niveau_permission: action === 'approve' ? 1 : 2,
        ...(action === 'reject' && { 
          statut_permission: 'rejeté',
          motif_refus: reason
        }),
      }, {
        headers: {
          'Authorization': `Bearer ${token || ''}`, // Use token from AuthContext
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissionsToValidate'] });
      setIsModalOpen(false);
      setRejectionReason('');
      setIsRejectionMode(false);
      
      toast.success('Action effectuée avec succès', {
        description: 'La demande de permission a été traitée.',
      });
    },
    onError: (error) => {
      console.error('Error validating permission:', error);
      toast.error('Échec de l\'action', {
        description: 'Impossible de traiter cette demande. Veuillez réessayer.',
      });
    },
  });

  const handlePermissionClick = (permission: PermissionToValidate) => {
    setSelectedPermission(permission);
    setIsModalOpen(true);
    setIsRejectionMode(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setRejectionReason('');
    setIsRejectionMode(false);
  };

  const handleApprove = () => {
    if (!selectedPermission) return;
    validateMutation.mutate({ 
      id: selectedPermission.id, 
      action: 'approve' 
    });
  };

  const handleReject = () => {
    if (!isRejectionMode) {
      setIsRejectionMode(true);
      return;
    }
    
    if (!selectedPermission) return;
    if (!rejectionReason.trim()) {
      toast.error('Motif requis', {
        description: 'Veuillez fournir un motif de refus.',
      });
      return;
    }
    
    validateMutation.mutate({ 
      id: selectedPermission.id, 
      action: 'reject',
      reason: rejectionReason
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-6 w-16" />
            </CardContent>
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
          Impossible de charger les demandes à valider. Veuillez actualiser la page ou réessayer plus tard.
        </p>
      </div>
    );
  }

  if (permissions?.length === 0) {
    return (
      <div className="bg-green-50 p-4 rounded-lg border border-green-200 flex items-center gap-3">
        <Info className="text-green-500 h-5 w-5" />
        <p className="text-green-700">
          Il n'y a aucune demande de permission en attente de validation.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {permissions?.map((permission: PermissionToValidate) => (
          <Card 
            key={permission.id} 
            className={`overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${
              permission.is_urgent ? 'border-l-4 border-l-[#F59E0B]' : ''
            }`}
            onClick={() => handlePermissionClick(permission)}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={permission.user.avatar_url} alt={permission.user.name} />
                <AvatarFallback>{permission.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <p className="font-medium text-[#172b4d]">{permission.user.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-3.5 w-3.5 text-gray-500" />
                  <span className="text-xs text-gray-600">
                    {format(new Date(permission.permission_date), 'd MMM yyyy', { locale: fr })}
                  </span>
                  <Clock className="h-3.5 w-3.5 text-gray-500 ml-2" />
                  <span className="text-xs text-gray-600">
                    {permission.start_time} - {permission.end_time}
                  </span>
                </div>
              </div>
              
              {permission.is_urgent && (
                <Badge className="bg-[#F59E0B]">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Urgent
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Validation de permission</DialogTitle>
            {isRejectionMode && (
              <DialogDescription>
                Veuillez fournir un motif de refus pour cette demande
              </DialogDescription>
            )}
          </DialogHeader>
          
          {selectedPermission && !isRejectionMode && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedPermission.user.avatar_url} alt={selectedPermission.user.name} />
                  <AvatarFallback>{selectedPermission.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedPermission.user.name}</p>
                  <p className="text-sm text-gray-500">Demande du {format(new Date(selectedPermission.request_date), 'PPP', { locale: fr })}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Date de permission</p>
                  <p>{format(new Date(selectedPermission.permission_date), 'PPP', { locale: fr })}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Horaires</p>
                  <p>{selectedPermission.start_time} - {selectedPermission.end_time}</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Motif de la demande</p>
                <p className="text-sm p-3 bg-gray-50 rounded-md">{selectedPermission.reason}</p>
              </div>
              
              {selectedPermission.is_urgent && (
                <div className="bg-amber-50 p-3 rounded-md flex gap-2 items-center">
                  <AlertTriangle className="h-5 w-5 text-[#F59E0B]" />
                  <p className="text-sm text-amber-800">Cette demande est marquée comme urgente</p>
                </div>
              )}
            </div>
          )}
          
          {isRejectionMode && (
            <div className="space-y-4">
              <Textarea
                placeholder="Veuillez expliquer la raison du refus..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          )}
          
          <DialogFooter className="sm:justify-between gap-3">
            {!isRejectionMode ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleCloseModal}
                  disabled={validateMutation.isPending}
                >
                  Fermer
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="destructive" 
                    onClick={handleReject}
                    disabled={validateMutation.isPending}
                  >
                    <XCircle className="mr-1.5 h-4 w-4" />
                    Refuser
                  </Button>
                  <Button 
                    variant="default"
                    className="bg-[#10B981] hover:bg-[#0E9F6E]"
                    onClick={handleApprove}
                    disabled={validateMutation.isPending}
                  >
                    {validateMutation.isPending ? (
                      <>
                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                        Validation...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-1.5 h-4 w-4" />
                        Approuver
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setIsRejectionMode(false)}
                  disabled={validateMutation.isPending}
                >
                  Retour
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleReject}
                  disabled={validateMutation.isPending || !rejectionReason.trim()}
                >
                  {validateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-1.5 h-4 w-4" />
                      Confirmer le refus
                    </>
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PermissionValidations;
