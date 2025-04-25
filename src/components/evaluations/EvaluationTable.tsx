
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface EvaluationItem {
  id: number;
  mission: string;
  code: string;
  date_auto_eval: string;
  date_eval: string;
  date_validation: string;
  evaluateur: string;
  demandeur: string;
  statut: string;
  niveau: 'Evaluateur' | 'Approbateur' | 'Terminé';
}

interface EvaluationTableProps {
  evaluations: EvaluationItem[];
  isLoading: boolean;
  activeFilter: string;
  onActionClick: (id: number, niveau: string) => void;
}

const EvaluationTable = ({ evaluations, isLoading, activeFilter, onActionClick }: EvaluationTableProps) => {
  const navigate = useNavigate();

  const handleEditClick = (evaluation: EvaluationItem) => {
    onActionClick(evaluation.id, evaluation.niveau);
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
      default:
        return {};
    }
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
            <TableHead>Niveau</TableHead>
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
                <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-4 w-[100px]" /></TableCell>
              </TableRow>
            ))
          ) : evaluations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-6">Aucune évaluation trouvée.</TableCell>
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
                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
                      Validée
                    </Badge>
                  ) : evaluation.statut === 'En cours' ? (
                    <Badge variant="secondary">En cours</Badge>
                  ) : (
                    <Badge>{evaluation.statut}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    {...getNiveauBadgeProps(evaluation.niveau)}
                  >
                    {evaluation.niveau}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {evaluation.statut === 'En cours' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(evaluation)}
                    >
                      <Pencil className="h-4 w-4" />
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
