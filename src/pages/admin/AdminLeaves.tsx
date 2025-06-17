
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import apiClient from '@/utils/apiClient';

interface LeaveData {
  id: number;
  nom: string;
  poste: string;
  departement: string;
  solde_conges: string;
  jours_pris: number;
  demandes_en_attente: number;
}

const AdminLeaves = () => {
  const [leavesData, setLeavesData] = useState<LeaveData[]>([]);
  const [filteredData, setFilteredData] = useState<LeaveData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeavesData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await apiClient.get('/admin/conges/liste');
        console.log('Admin leaves data:', response.data);
        const data = Array.isArray(response.data) ? response.data : [];
        setLeavesData(data);
        setFilteredData(data);
      } catch (err) {
        console.error('Error fetching leaves data:', err);
        setError('Impossible de charger les données de congés');
        setLeavesData([]);
        setFilteredData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeavesData();
  }, []);

  useEffect(() => {
    const filtered = leavesData.filter(item =>
      item.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.poste.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.departement.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchTerm, leavesData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Gestion des Congés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              {[...Array(5)].map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gestion des Congés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Erreur de chargement</h3>
            <p className="text-gray-500">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des Congés</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher par nom, poste ou département..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Table des congés */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold">Nom</TableHead>
                  <TableHead className="font-semibold">Poste</TableHead>
                  <TableHead className="font-semibold">Département</TableHead>
                  <TableHead className="font-semibold">Solde congés</TableHead>
                  <TableHead className="font-semibold">Jours pris</TableHead>
                  <TableHead className="font-semibold">Demandes en attente</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium">{item.nom}</TableCell>
                    <TableCell>{item.poste}</TableCell>
                    <TableCell>{item.departement}</TableCell>
                    <TableCell>
                      <span className="font-semibold text-blue-600">{item.solde_conges} jours</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-amber-600">{item.jours_pris} jours</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-green-600">{item.demandes_en_attente} demandes</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredData.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Aucun résultat</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Aucun collaborateur ne correspond à votre recherche.' : 'Aucune donnée de congés disponible.'}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminLeaves;
