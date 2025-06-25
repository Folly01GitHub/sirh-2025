
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
import { Search, Award, Users, Eye, TrendingUp, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

type SortField = 'name' | 'position' | 'department' | 'evaluations_terminees' | 'evaluations_en_cours' | 'moyenne_evaluations';
type SortDirection = 'asc' | 'desc' | null;

interface SortConfig {
  field: SortField | null;
  direction: SortDirection;
}

const AdminEvaluations = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: null, direction: null });

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    let filtered = employees.filter(employee =>
      (employee.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (employee.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (employee.position?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (employee.department?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    // Apply sorting
    if (sortConfig.field && sortConfig.direction) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortConfig.field) {
          case 'name':
            aValue = `${a.firstName || ''} ${a.lastName || ''}`.trim().toLowerCase();
            bValue = `${b.firstName || ''} ${b.lastName || ''}`.trim().toLowerCase();
            break;
          case 'position':
            aValue = (a.position || '').toLowerCase();
            bValue = (b.position || '').toLowerCase();
            break;
          case 'department':
            aValue = (a.department || '').toLowerCase();
            bValue = (b.department || '').toLowerCase();
            break;
          case 'evaluations_terminees':
            aValue = a.evaluations_terminees || 0;
            bValue = b.evaluations_terminees || 0;
            break;
          case 'evaluations_en_cours':
            aValue = a.evaluations_en_cours || 0;
            bValue = b.evaluations_en_cours || 0;
            break;
          case 'moyenne_evaluations':
            aValue = a.moyenne_evaluations || 0;
            bValue = b.moyenne_evaluations || 0;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredEmployees(filtered);
  }, [employees, searchTerm, sortConfig]);

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

  const handleSort = (field: SortField) => {
    let direction: SortDirection = 'asc';
    
    if (sortConfig.field === field && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.field === field && sortConfig.direction === 'desc') {
      direction = null;
    }

    setSortConfig({ field: direction ? field : null, direction });
  };

  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    
    if (sortConfig.direction === 'asc') {
      return <ArrowUp className="h-4 w-4 text-blue-600" />;
    } else if (sortConfig.direction === 'desc') {
      return <ArrowDown className="h-4 w-4 text-blue-600" />;
    }
    
    return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
  };

  const handleViewDetails = (employee: Employee) => {
    // Stocker les données de l'employé dans localStorage pour la page de détails
    localStorage.setItem('adminUsers', JSON.stringify(employees));
    navigate(`/admin/user-stats-evals/${employee.id}`);
  };

  const handleViewFeedback = (employee: Employee) => {
    // Stocker les données de l'employé dans localStorage pour la page de feedback
    localStorage.setItem('adminUsers', JSON.stringify(employees));
    navigate(`/admin/user-feedback/${employee.id}`);
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
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50 select-none"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-2">
                        Nom
                        {getSortIcon('name')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50 select-none"
                      onClick={() => handleSort('position')}
                    >
                      <div className="flex items-center gap-2">
                        Poste
                        {getSortIcon('position')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50 select-none"
                      onClick={() => handleSort('department')}
                    >
                      <div className="flex items-center gap-2">
                        Département
                        {getSortIcon('department')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-center cursor-pointer hover:bg-gray-50 select-none"
                      onClick={() => handleSort('evaluations_terminees')}
                    >
                      <div className="flex items-center justify-center gap-2">
                        Évaluations validées
                        {getSortIcon('evaluations_terminees')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-center cursor-pointer hover:bg-gray-50 select-none"
                      onClick={() => handleSort('evaluations_en_cours')}
                    >
                      <div className="flex items-center justify-center gap-2">
                        Évaluations en cours
                        {getSortIcon('evaluations_en_cours')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-center cursor-pointer hover:bg-gray-50 select-none"
                      onClick={() => handleSort('moyenne_evaluations')}
                    >
                      <div className="flex items-center justify-center gap-2">
                        Note globale
                        {getSortIcon('moyenne_evaluations')}
                      </div>
                    </TableHead>
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
                              onClick={() => handleViewDetails(employee)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              title="Points forts et axes d'amélioration"
                              onClick={() => handleViewFeedback(employee)}
                            >
                              <TrendingUp className="h-4 w-4" />
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
