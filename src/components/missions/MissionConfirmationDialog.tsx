
import React from 'react';
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

interface MissionConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  action: 'approve' | 'reject';
  missionTitle: string;
}

const MissionConfirmationDialog = ({
  isOpen,
  onOpenChange,
  onConfirm,
  action,
  missionTitle
}: MissionConfirmationDialogProps) => {
  const isApprove = action === 'approve';
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isApprove ? 'Valider la mission' : 'Refuser la mission'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir {isApprove ? 'valider' : 'refuser'} la mission "{missionTitle}" ?
            {!isApprove && ' Cette action ne peut pas être annulée.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={isApprove ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
          >
            {isApprove ? 'Valider' : 'Refuser'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default MissionConfirmationDialog;
