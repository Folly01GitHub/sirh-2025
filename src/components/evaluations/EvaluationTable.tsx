
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Eye, Send } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import DebriefDialog from './DebriefDialog';

interface EvaluationItem {
  id: number;
  mission: string;
  client: string;
  code: string;
  date_auto_eval: string;
  date_eval: string;
  date_validation: string;
  evaluateur: string;
  approbateur: string;
  demandeur: string;
  statut: string;
  niveau: 'Evaluateur' | 'Approbateur' | 'Terminé' | 'Auto-évaluation';
  isPencil?: boolean; // New attribute for controlling edit button display
}

interface EvaluationTableProps {
  evaluations: EvaluationItem[];
  isLoading: boolean;
  activeFilter: string;
  onActionClick: (id: number, niveau: string) => void;
}

const EvaluationTable = ({ evaluations, isLoading, activeFilter, onActionClick }: EvaluationTableProps) => {
  const navigate = useNavigate();

  const [dialogEvaluationId, setDialogEvaluationId] = useState<number | null>(null);

  const handleEditClick = (evaluationId: number, niveau: string) => {
    onActionClick(evaluationId, niveau);
  };

  const handleViewClick = (evaluationId: number) => {
    navigate(`/evaluation-view?id=${evaluationId}`);
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

  // Updated: Show edit button only if isPencil is true
  const shouldShowEditButton = (evaluation: EvaluationItem) => {
    return evaluation.isPencil === true;
  };

  const shouldShowViewButton = (evaluation: EvaluationItem) => {
    if (activeFilter === 'self') {
      return !(evaluation.statut === 'brouillon' || evaluation.statut === 'Evaluation en cours');
    }
    return true;
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
                  {/* Bouton d'envoi d'évaluation (avion en papier) */}
                  {activeFilter === 'self' && evaluation.statut === 'Debrief' && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Envoyer l'évaluation"
                        onClick={() => setDialogEvaluationId(evaluation.id)}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      <DebriefDialog
                        open={dialogEvaluationId === evaluation.id}
                        onOpenChange={(open) => {
                          if (!open) setDialogEvaluationId(null);
                        }}
                        evaluationId={evaluation.id}
                        // Optionnel: onSuccess={() => ...}
                      />
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

export default EvaluationTable;
