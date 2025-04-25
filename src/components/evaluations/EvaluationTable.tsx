
import React from 'react';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ClipboardEdit, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
  onActionClick: (id: number, niveau: 'Evaluateur' | 'Approbateur' | 'Terminé') => void;
}

const EvaluationTable: React.FC<EvaluationTableProps> = ({ 
  evaluations, 
  isLoading, 
  activeFilter,
  onActionClick 
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <Skeleton className="h-8 w-2/3 mb-4" />
        <Skeleton className="h-10 w-full mb-3" />
        <Skeleton className="h-10 w-full mb-3" />
        <Skeleton className="h-10 w-full mb-3" />
      </div>
    );
  }

  if (evaluations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">Aucune évaluation trouvée</h3>
        <p className="text-gray-500">
          {activeFilter === 'self' 
            ? "Vous n'avez pas encore d'évaluations en cours."
            : "Aucune évaluation à consulter pour vos collaborateurs."}
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'En attente':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">En attente</Badge>;
      case 'Validé':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Validé</Badge>;
      case 'Refusé':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Refusé</Badge>;
      case 'En cours':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">En cours</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mission</TableHead>
            <TableHead>Code</TableHead>
            <TableHead className="hidden md:table-cell">Demandeur</TableHead>
            {activeFilter === 'team' && (
              <TableHead className="hidden md:table-cell">Évaluateur</TableHead>
            )}
            <TableHead className="hidden lg:table-cell">Date</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {evaluations.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.mission}</TableCell>
              <TableCell>{item.code}</TableCell>
              <TableCell className="hidden md:table-cell">{item.demandeur}</TableCell>
              {activeFilter === 'team' && (
                <TableCell className="hidden md:table-cell">{item.evaluateur}</TableCell>
              )}
              <TableCell className="hidden lg:table-cell">
                {item.statut === 'Validé' ? item.date_validation : 
                 item.statut === 'En cours' ? item.date_eval : item.date_auto_eval}
              </TableCell>
              <TableCell>{getStatusBadge(item.statut)}</TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onActionClick(item.id, item.niveau)}
                  className="space-x-1"
                >
                  {item.niveau === 'Terminé' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <ClipboardEdit className="h-4 w-4" />
                  )}
                  <span>Voir</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default EvaluationTable;
