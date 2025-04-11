
import React from 'react';
import { User } from '@/types/user.types';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface UserDeleteDialogProps {
  user: User | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}

const UserDeleteDialog: React.FC<UserDeleteDialogProps> = ({ 
  user, 
  isOpen, 
  onOpenChange, 
  onConfirm 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action ne peut pas être annulée.
          </DialogDescription>
        </DialogHeader>
        <div className="bg-red-50 p-4 rounded-md border border-red-200 mb-4">
          <p className="text-sm text-red-800">
            Vous êtes sur le point de supprimer : <strong>{user?.firstName} {user?.lastName}</strong> ({user?.email})
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserDeleteDialog;
