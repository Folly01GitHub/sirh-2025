import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EvaluationItem } from '@/pages/Evaluation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, BarChart4, CheckCircle, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface EvaluationTableProps {
  evaluations: EvaluationItem[];
  isLoading: boolean;
  activeFilter: string;
  onActionClick: (id: number) => void;
}

const EvaluationTable = ({ evaluations, isLoading, activeFilter, onActionClick }: EvaluationTableProps) => {
  const navigate = useNavigate();

  const handleEditClick = (evaluationId: number) => {
    navigate(`/evaluation?id=${evaluationId}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mission</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Date Auto-Eval</TableHead>
            <TableHead>Date Eval</TableHead>
            <TableHead>Date Validation</TableHead>
            <TableHead>Evaluateur</TableHead>
            <TableHead>Demandeur</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
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
              <TableCell colSpan={9} className="text-center py-6">Aucune évaluation trouvée.</TableCell>
            </TableRow>
          ) : (
            evaluations.map((evaluation) => (
              <TableRow key={evaluation.id}>
                <TableCell>{evaluation.mission}</TableCell>
                <TableCell>{evaluation.code}</TableCell>
                <TableCell>{evaluation.date_auto_eval}</TableCell>
                <TableCell>{evaluation.date_eval}</TableCell>
                <TableCell>{evaluation.date_validation}</TableCell>
                <TableCell>{evaluation.evaluateur}</TableCell>
                <TableCell>{evaluation.demandeur}</TableCell>
                <TableCell>
                  {evaluation.statut === 'Validée' ? (
                    <Badge variant="success">Validée</Badge>
                  ) : evaluation.statut === 'En cours' ? (
                    <Badge variant="secondary">En cours</Badge>
                  ) : (
                    <Badge>{evaluation.statut}</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditClick(evaluation.id)}
                    className="gap-2"
                  >
                    <Pencil className="h-4 w-4" />
                    Modifier
                  </Button>
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
