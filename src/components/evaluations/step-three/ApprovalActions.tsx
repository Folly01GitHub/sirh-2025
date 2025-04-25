
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle } from 'lucide-react';

interface ApprovalActionsProps {
  onApprove: (approved: boolean, comment?: string) => void;
  isLoading: boolean;
}

const ApprovalActions: React.FC<ApprovalActionsProps> = ({ onApprove, isLoading }) => {
  const [comment, setComment] = useState("");
  const [showRejectionComment, setShowRejectionComment] = useState(false);

  const handleApprove = () => {
    onApprove(true);
  };

  const handleReject = () => {
    if (!comment || comment.trim().length < 10) {
      alert("Veuillez fournir un commentaire de rejet d'au moins 10 caractères");
      return;
    }
    onApprove(false, comment);
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg border mt-8">
      <h3 className="text-xl font-medium mb-4">Décision finale</h3>
      
      {showRejectionComment ? (
        <div className="space-y-4">
          <p className="text-gray-700">
            Veuillez fournir un commentaire expliquant les raisons du rejet :
          </p>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Détaillez les raisons du rejet et les axes d'amélioration…"
            className="min-h-[150px]"
          />
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Button 
              onClick={() => setShowRejectionComment(false)}
              variant="outline"
            >
              Annuler
            </Button>
            <Button 
              onClick={handleReject}
              variant="destructive"
              disabled={isLoading || comment.trim().length < 10}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Confirmer le rejet
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={handleApprove}
            className="bg-green-600 hover:bg-green-700"
            disabled={isLoading}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Valider l'évaluation
          </Button>
          <Button 
            onClick={() => setShowRejectionComment(true)}
            variant="destructive"
            disabled={isLoading}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Rejeter l'évaluation
          </Button>
        </div>
      )}
    </div>
  );
};

export default ApprovalActions;
