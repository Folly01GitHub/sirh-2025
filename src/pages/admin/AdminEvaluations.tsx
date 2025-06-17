
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Search, Award, Users, Eye } from 'lucide-react';
import apiClient from '@/utils/apiClient';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  department: string;
  evaluations_terminees: number;
  evaluations_en_cours: number;
  moyenne_evaluations: number;
}

const AdminEvaluations = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    const filtered = employees.filter(employee =>
      (employee.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (employee.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (employee.position?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (employee.department?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
    setFilteredEmployees(filtered);
  }, [employees, searchTerm]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/userListe/evaluations');
      setEmployees(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
      // Fallback to empty array if API fails
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const formatGlobalScore = (score: any): string => {
    if (score == null || score === '') return 'N/A';
    
    const numericScore = typeof score === 'string' ? parseFloat(score) : Number(score);
    
    if (isNaN(numericScore)) return 'N/A';
    
    return `${numericScore.toFixed(1)}/5`;
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Award className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Gestion des Évaluations</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Liste des Collaborateurs
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher par nom, poste ou département..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Poste</TableHead>
                    <TableHead>Département</TableHead>
                    <TableHead className="text-center">Évaluations validées</TableHead>
                    <TableHead className="text-center">Évaluations en cours</TableHead>
                    <TableHead className="text-center">Note globale</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Chargement...
                      </TableCell>
                    </TableRow>
                  ) : filteredEmployees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        Aucun collaborateur trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEmployees.map((employee) => (
                      <TableRow key={employee.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {`${employee.firstName || ''} ${employee.lastName || ''}`.trim()}
                        </TableCell>
                        <TableCell>{employee.position || 'N/A'}</TableCell>
                        <TableCell>{employee.department || 'N/A'}</TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-green-100 text-green-800">
                            {employee.evaluations_terminees || 0}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {(employee.evaluations_en_cours || 0) > 0 ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
                              {employee.evaluations_en_cours}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-gray-100 text-gray-600">
                              0
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800 font-medium">
                            {formatGlobalScore(employee.moyenne_evaluations)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              title="Voir les détails"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminEvaluations;
