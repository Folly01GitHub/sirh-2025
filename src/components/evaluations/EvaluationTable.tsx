
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import LucideIcon from '@/components/ui/LucideIcon';

interface EvaluationItem {
  id: number;
  mission: string;
  client: string; // Added client field
  code: string;
  date_auto_eval: string;
  date_eval: string;
  date_validation: string;
  evaluateur: string;
  approbateur: string; // Added approbateur field
  demandeur: string;
  statut: string;
  niveau: 'Evaluateur' | 'Approbateur' | 'Terminé' | 'Auto-évaluation';
}

interface EvaluationTableProps {
  evaluations: EvaluationItem[];
  isLoading: boolean;
  activeFilter: string;
  onActionClick: (id: number, niveau: string) => void;
}

const EvaluationTable = ({ evaluations, isLoading, activeFilter, onActionClick }: EvaluationTableProps) => {
  const navigate = useNavigate();

  const handleEditClick = (evaluationId: number, niveau: string) => {
    onActionClick(evaluationId, niveau);
  };

  const handleViewClick = (evaluationId: number) => {
    navigate(`/evaluation-view?id=${evaluationId}`);
  };

  const handleMessageClick = (evaluationId: number) => {
    alert(`Envoyer un message pour l'évaluation #${evaluationId}`);
  };

  const getNiveauBadgeProps = (niveau: string) => {
    switch (niveau) {
      case 'Evaluateur':
        return { style: { backgroundColor: '#F2FCE2', color: 'black' } };
      case 'Approbateur':
        return { style: { backgroundColor: '#FEF7CD', color: 'black' } };
      case 'HR':
        return { style: { backgroundColor: '#FEC6A1', color: 'black' } };
      case 'Terminé':
        return { style: { backgroundColor: '#9b87f5', color: 'white' } };
      case 'Auto-évaluation':
        return { style: { backgroundColor: '#E2E8FC', color: 'black' } };
      default:
        return {};
    }
  };

  // Helper function to determine if the edit button should be displayed
  const shouldShowEditButton = (evaluation: EvaluationItem) => {
    // For team evaluations, check status conditions
    if (activeFilter === 'team') {
      return evaluation.statut === 'En cours' || 
             evaluation.statut === 'brouillon' ||
             evaluation.statut === 'Evaluation en cours' ||
             evaluation.statut === 'Approbation en cours';
    }
    
    // For self evaluations, only check niveau
    if (activeFilter === 'self') {
      return evaluation.niveau === 'Auto-évaluation';
    }
    
    return false;
  };

  // Helper function to determine if the view button should be displayed
  const shouldShowViewButton = (evaluation: EvaluationItem) => {
    // For self evaluations section, hide the view button if status is "brouillon" or "Evaluation en cours"
    if (activeFilter === 'self') {
      return !(evaluation.statut === 'brouillon' || evaluation.statut === 'Evaluation en cours');
    }
    
    // For team evaluations, show the view button for all statuses
    return true;
  };

  // Helper for the bouton message
  const shouldShowMessageButton = (evaluation: EvaluationItem) => {
    return activeFilter === 'self' && evaluation.statut === 'Debrief';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mission</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Date Auto-Eval</TableHead>
            <TableHead>Date Eval</TableHead>
            {/* Affichage dynamique du header */}
            {activeFilter === 'team' ? (
              <TableHead>Demandeur</TableHead>
            ) : (
              <TableHead>Date Validation</TableHead>
            )}
            <TableHead>Evaluateur</TableHead>
            <TableHead>Approbateur</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-4 w-[100px]" /></TableCell>
              </TableRow>
            ))
          ) : evaluations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-6">
                Aucune évaluation trouvée.
              </TableCell>
            </TableRow>
          ) : (
            evaluations.map((evaluation) => (
              <TableRow key={evaluation.id}>
                <TableCell>{evaluation.mission}</TableCell>
                <TableCell>{evaluation.client || "-"}</TableCell>
                <TableCell>{evaluation.date_auto_eval}</TableCell>
                <TableCell>{evaluation.date_eval}</TableCell>
                {/* Affichage dynamique de la cellule : soit demandeur, soit date_validation */}
                {activeFilter === 'team' ? (
                  <TableCell>{evaluation.demandeur || "-"}</TableCell>
                ) : (
                  <TableCell>{evaluation.date_validation}</TableCell>
                )}
                <TableCell>{evaluation.evaluateur}</TableCell>
                <TableCell>{evaluation.approbateur || "-"}</TableCell>
                <TableCell>
                  {evaluation.statut === 'Validée' ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
                      Validée
                    </Badge>
                  ) : evaluation.statut === 'En cours' ? (
                    <Badge variant="secondary">En cours</Badge>
                  ) : evaluation.statut === 'brouillon' ? (
                    <Badge variant="outline" className="border-amber-300 text-amber-600">
                      Brouillon
                    </Badge>
                  ) : evaluation.statut === 'Evaluation en cours' ? (
                    <Badge variant="outline" className="border-blue-300 text-blue-600">
                      Evaluation en cours
                    </Badge>
                  ) : (
                    <Badge>{evaluation.statut}</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  {shouldShowViewButton(evaluation) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewClick(evaluation.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  {shouldShowEditButton(evaluation) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(evaluation.id, evaluation.niveau)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {shouldShowMessageButton(evaluation) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Envoyer un message"
                      onClick={() => handleMessageClick(evaluation.id)}
                    >
                      <LucideIcon name="paper-plane" className="h-4 w-4" />
                    </Button>
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

export default EvaluationTable;
