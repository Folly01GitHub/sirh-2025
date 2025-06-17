
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/utils/apiClient';

interface LeaveRequest {
  id: string;
  dateCreation: string;
  dateDebut: string;
  dateFin: string;
  nombreJours: number;
  status?: string;
}

interface UserLeaveRequestsTableProps {
  userId: string | undefined;
}

const UserLeaveRequestsTable = ({ userId }: UserLeaveRequestsTableProps) => {
  const navigate = useNavigate();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchLeaveRequests();
    }
  }, [userId]);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/admin/user/${userId}/conges`);
      setLeaveRequests(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des demandes de congés:', error);
      setLeaveRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (requestId: string) => {
    navigate(`/leave-details/${requestId}`);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return dateString;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Historique des Demandes de Congés
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date demande</TableHead>
                <TableHead>Date de début</TableHead>
                <TableHead>Date de fin</TableHead>
                <TableHead className="text-center">Jours pris</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : leaveRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    Aucune demande de congé trouvée
                  </TableCell>
                </TableRow>
              ) : (
                leaveRequests.map((request) => (
                  <TableRow key={request.id} className="hover:bg-gray-50">
                    <TableCell>{formatDate(request.dateCreation)}</TableCell>
                    <TableCell>{formatDate(request.dateDebut)}</TableCell>
                    <TableCell>{formatDate(request.dateFin)}</TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                        {request.nombreJours || 0} jours
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        title="Voir les détails"
                        onClick={() => handleViewDetails(request.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserLeaveRequestsTable;
