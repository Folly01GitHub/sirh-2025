
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
import { Search, CalendarDays, Users, Eye } from 'lucide-react';
import apiClient from '@/utils/apiClient';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  department: string;
  solde_conges_legaux: number;
  jours_legaux_pris_annee: number;
  nombre_demandes_en_attente: number;
}

const AdminLeaves = () => {
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
      const response = await apiClient.get('/admin/userListe/conges');
      setEmployees(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
      // Fallback to empty array if API fails
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <CalendarDays className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Gestion des Congés</h1>
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
                    <TableHead className="text-center">Solde congés</TableHead>
                    <TableHead className="text-center">Jours pris</TableHead>
                    <TableHead className="text-center">Demandes en attente</TableHead>
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
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                            {employee.solde_conges_legaux || 0} jours
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-amber-100 text-amber-800">
                            {employee.jours_legaux_pris_annee || 0}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
                            {employee.nombre_demandes_en_attente || 0}
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

export default AdminLeaves;
