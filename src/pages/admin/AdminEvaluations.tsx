
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
import { Search, Award, Users, Eye, Edit } from 'lucide-react';
import apiClient from '@/utils/apiClient';

interface Employee {
  id: string;
  nom: string;
  poste: string;
  departement: string;
  evaluations_validees: number;
  evaluations_en_cours: number;
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
      employee.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.poste.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.departement.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmployees(filtered);
  }, [employees, searchTerm]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      // Simulation des données - remplacer par l'API réelle
      const mockData: Employee[] = [
        {
          id: '1',
          nom: 'Jean Dupont',
          poste: 'Développeur Senior',
          departement: 'IT',
          evaluations_validees: 4,
          evaluations_en_cours: 1
        },
        {
          id: '2',
          nom: 'Marie Martin',
          poste: 'Chef de Projet',
          departement: 'Management',
          evaluations_validees: 6,
          evaluations_en_cours: 0
        },
        {
          id: '3',
          nom: 'Pierre Durand',
          poste: 'Designer UX',
          departement: 'Design',
          evaluations_validees: 3,
          evaluations_en_cours: 2
        }
      ];
      setEmployees(mockData);
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
    } finally {
      setLoading(false);
    }
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
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Chargement...
                      </TableCell>
                    </TableRow>
                  ) : filteredEmployees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        Aucun collaborateur trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEmployees.map((employee) => (
                      <TableRow key={employee.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{employee.nom}</TableCell>
                        <TableCell>{employee.poste}</TableCell>
                        <TableCell>{employee.departement}</TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-green-100 text-green-800">
                            {employee.evaluations_validees}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {employee.evaluations_en_cours > 0 ? (
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
                          <div className="flex justify-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              title="Voir les détails"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              title="Modifier"
                            >
                              <Edit className="h-4 w-4" />
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
