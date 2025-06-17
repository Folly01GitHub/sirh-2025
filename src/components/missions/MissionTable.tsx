
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Check, X } from 'lucide-react';

interface MissionItem {
  id: string;
  code: string;
  title: string;
  client: string;
  startDate: string;
  endDate: string;
  status: 'validated' | 'pending' | 'rejected' | 'en_attente' | 'validee' | 'refusee';
  requester?: string;
}

interface MissionTableProps {
  missions: MissionItem[];
  isLoading: boolean;
  activeFilter: string;
  onActionClick: (id: string, action: string) => void;
}

const MissionTable = ({ missions, isLoading, activeFilter, onActionClick }: MissionTableProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'validated':
      case 'validee':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Validée</Badge>;
      case 'pending':
      case 'en_attente':
        return <Badge variant="default" className="bg-amber-100 text-amber-800 border-amber-200">En attente</Badge>;
      case 'rejected':
      case 'refusee':
        return <Badge variant="default" className="bg-red-100 text-red-800 border-red-200">Refusée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!missions || missions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500">Aucune mission trouvée</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code mission</TableHead>
            <TableHead>Libellé mission</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Date de début</TableHead>
            <TableHead>Date de fin</TableHead>
            <TableHead>Statut</TableHead>
            {activeFilter === 'team' && <TableHead>Demandeur</TableHead>}
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {missions.map((mission) => (
            <TableRow key={mission.id}>
              <TableCell className="font-medium">{mission.code}</TableCell>
              <TableCell>{mission.title}</TableCell>
              <TableCell>{mission.client}</TableCell>
              <TableCell>{formatDate(mission.startDate)}</TableCell>
              <TableCell>{formatDate(mission.endDate)}</TableCell>
              <TableCell>{getStatusBadge(mission.status)}</TableCell>
              {activeFilter === 'team' && <TableCell>{mission.requester}</TableCell>}
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onActionClick(mission.id, 'view')}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Voir les détails
                  </Button>
                  {activeFilter === 'team' && mission.status === 'en_attente' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => onActionClick(mission.id, 'approve')}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Valider
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => onActionClick(mission.id, 'reject')}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Refuser
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MissionTable;
