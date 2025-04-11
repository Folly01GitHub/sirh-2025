
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Filter, Download, Search } from 'lucide-react';
import { toast } from 'sonner';

import { User, FilterFormData, UserEditFormData, generateMockUsers } from '@/types/user.types';
import { exportToCsv } from '@/utils/exportUtils';
import UserTableRow from './UserTableRow';
import UserEditDialog from './UserEditDialog';
import UserDeleteDialog from './UserDeleteDialog';
import UserFilterDialog from './UserFilterDialog';

const UserTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterFormData>({});

  // Fetch users (simulate API call)
  useEffect(() => {
    const fetchUsers = async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      setUsers(generateMockUsers());
      setLoading(false);
    };

    fetchUsers();
  }, []);

  // Handle editing a user
  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  // Handle deleting a user
  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  // Submit the edit form
  const onEditSubmit = async (data: UserEditFormData) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update the user in the local state
    if (selectedUser) {
      setUsers(users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, ...data } 
          : user
      ));
      toast.success("Utilisateur mis à jour avec succès");
      setIsEditDialogOpen(false);
    }
  };

  // Confirm deletion of a user
  const confirmDelete = async () => {
    if (!selectedUser) return;
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Remove the user from the local state
    setUsers(users.filter(user => user.id !== selectedUser.id));
    toast.success("Utilisateur supprimé avec succès");
    setIsDeleteDialogOpen(false);
  };

  // Apply filters
  const applyFilters = (data: FilterFormData) => {
    setFilters(data);
    setIsFilterDialogOpen(false);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({});
    setIsFilterDialogOpen(false);
  };

  // Filter and search the users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      searchTerm === '' || 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filters.status || user.status === filters.status;
    const matchesPosition = !filters.position || user.position === filters.position;
    const matchesDepartment = !filters.department || user.department === filters.department;
    
    const userDate = new Date(user.dateCreated);
    const matchesDateFrom = !filters.dateFrom || userDate >= filters.dateFrom;
    const matchesDateTo = !filters.dateTo || userDate <= filters.dateTo;
    
    return matchesSearch && matchesStatus && matchesPosition && matchesDepartment && matchesDateFrom && matchesDateTo;
  });

  return (
    <div className="glass-card rounded-lg p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Rechercher des utilisateurs..." 
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" onClick={() => setIsFilterDialogOpen(true)}>
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <Button 
          variant="outline" 
          className="gap-2 w-full md:w-auto" 
          onClick={() => exportToCsv(filteredUsers)}
        >
          <Download className="h-4 w-4" />
          Exporter CSV
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30px]">#</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Poste</TableHead>
              <TableHead>Département</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date de Création</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 8 }).map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                  Aucun utilisateur trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map(user => (
                <UserTableRow 
                  key={user.id} 
                  user={user} 
                  onEdit={handleEdit} 
                  onDelete={handleDelete}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialogs */}
      <UserEditDialog 
        user={selectedUser} 
        isOpen={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
        onSave={onEditSubmit} 
      />
      
      <UserDeleteDialog 
        user={selectedUser} 
        isOpen={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen} 
        onConfirm={confirmDelete} 
      />
      
      <UserFilterDialog 
        isOpen={isFilterDialogOpen} 
        onOpenChange={setIsFilterDialogOpen} 
        onApplyFilters={applyFilters} 
        onResetFilters={resetFilters} 
        currentFilters={filters} 
      />
    </div>
  );
};

export default UserTable;
