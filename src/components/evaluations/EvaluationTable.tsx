
import React from 'react';
import { Pencil } from 'lucide-react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  onActionClick: (id: number) => void;
}

const EvaluationTable: React.FC<EvaluationTableProps> = ({
  evaluations,
  isLoading,
  activeFilter,
  onActionClick
}) => {
  // Define column person label based on filter
  const personLabel = activeFilter === 'self' ? 'Evaluateur' : 'Demandeur';
  
  // Get badge variant based on niveau
  const getBadgeVariant = (niveau: string) => {
    switch (niveau) {
      case 'Evaluateur':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
      case 'Approbateur':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'Terminé':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mission</TableHead>
                <TableHead>Code</TableHead>
                <TableHead className="hidden sm:table-cell">Date Auto-Éval</TableHead>
                <TableHead className="hidden md:table-cell">Date Éval</TableHead>
                <TableHead className="hidden lg:table-cell">Date Valid</TableHead>
                <TableHead>{personLabel}</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Niveau</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (evaluations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500">Aucune évaluation disponible</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 overflow-x-auto">
        <Table>
          <TableCaption>Liste des évaluations</TableCaption>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Mission</TableHead>
              <TableHead>Code</TableHead>
              <TableHead className="hidden sm:table-cell">Date Auto-Éval</TableHead>
              <TableHead className="hidden md:table-cell">Date Éval</TableHead>
              <TableHead className="hidden lg:table-cell">Date Valid</TableHead>
              <TableHead>{personLabel}</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Niveau</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {evaluations.map((evaluation, index) => (
              <TableRow 
                key={evaluation.id}
                className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-gray-50/50' : ''}`}
              >
                <TableCell className="font-medium">{evaluation.mission}</TableCell>
                <TableCell className="font-mono text-xs">{evaluation.code}</TableCell>
                <TableCell className="hidden sm:table-cell">{evaluation.date_auto_eval}</TableCell>
                <TableCell className="hidden md:table-cell">{evaluation.date_eval || '-'}</TableCell>
                <TableCell className="hidden lg:table-cell">{evaluation.date_validation || '-'}</TableCell>
                <TableCell>
                  {activeFilter === 'self' ? evaluation.evaluateur : evaluation.demandeur}
                </TableCell>
                <TableCell>{evaluation.statut}</TableCell>
                <TableCell>
                  <Badge className={`${getBadgeVariant(evaluation.niveau)} font-normal`}>
                    {evaluation.niveau}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {evaluation.statut === "En cours" && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onActionClick(evaluation.id)}
                      title={activeFilter === 'self' ? "Modifier l'évaluation" : "Valider l'évaluation"}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default EvaluationTable;
