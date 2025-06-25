
import React, { useState, useEffect, useMemo } from 'react';
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
import { Filter, Download, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';

import { User, FilterFormData } from '@/types/user.types';
import { exportToCsv } from '@/utils/exportUtils';
import UserTableRow from './UserTableRow';
import UserDeleteDialog from './UserDeleteDialog';
import UserFilterDialog from './UserFilterDialog';
import apiClient from '@/utils/apiClient';

type SortField = 'name' | 'email' | 'position' | 'department' | 'dateCreated';
type SortDirection = 'asc' | 'desc' | null;

interface SortConfig {
  field: SortField | null;
  direction: SortDirection;
}

const UserTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterFormData>({});
  const [error, setError] = useState<string | null>(null);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: null, direction: null });

  // Extract unique departments from users
  const uniqueDepartments = useMemo(() => {
    if (!users || users.length === 0) return [];
    const departments = users
      .map(user => user.department)
      .filter((department): department is string => !!department);
    return [...new Set(departments)].sort();
  }, [users]);

  // Extract unique positions from users
  const uniquePositions = useMemo(() => {
    if (!users || users.length === 0) return [];
    const positions = users
      .map(user => user.position)
      .filter((position): position is string => !!position);
    return [...new Set(positions)].sort();
  }, [users]);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get('/employees');
        console.log('API Response:', response.data);
        
        // Handle different API response structures
        let fetchedUsers: User[] = [];
        if (Array.isArray(response.data)) {
          fetchedUsers = response.data;
        } else if (response.data && Array.isArray(response.data.employees)) {
          fetchedUsers = response.data.employees;
        } else {
          console.warn('Unexpected API response format:', response.data);
          fetchedUsers = [];
        }
        
        setUsers(fetchedUsers);
        
        // Store users in localStorage for UserStats component
        localStorage.setItem('adminUsers', JSON.stringify(fetchedUsers));
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Impossible de charger la liste des utilisateurs. Veuillez réessayer plus tard.');
        toast.error('Erreur lors du chargement des utilisateurs');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Count active filters
  useEffect(() => {
    let count = 0;
    if (filters.status && filters.status !== "all") count++;
    if (filters.position && filters.position !== "all") count++;
    if (filters.department && filters.department !== "all") count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    setActiveFiltersCount(count);
  }, [filters]);

  // Handle deleting a user
  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  // Confirm deletion of a user
  const confirmDelete = async () => {
    if (!selectedUser) return;
    
    setLoading(true);
    try {
      await apiClient.delete(`/employees/${selectedUser.id}`);
      
      // Remove the user from the local state
      setUsers(users.filter(user => user.id !== selectedUser.id));
      toast.success("Utilisateur supprimé avec succès");
      setIsDeleteDialogOpen(false);
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error("Erreur lors de la suppression de l'utilisateur");
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const applyFilters = (data: FilterFormData) => {
    console.log('Applying filters:', data);
    setFilters(data);
    setIsFilterDialogOpen(false);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({});
    setIsFilterDialogOpen(false);
  };

  // Handle sorting
  const handleSort = (field: SortField) => {
    let direction: SortDirection = 'asc';
    
    if (sortConfig.field === field && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.field === field && sortConfig.direction === 'desc') {
      direction = null;
    }

    setSortConfig({ field: direction ? field : null, direction });
  };

  // Get sort icon
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

  // Filter and search the users
  const filteredUsers = useMemo(() => {
    let filtered = users.filter(user => {
      const matchesSearch = 
        searchTerm === '' || 
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Update filter logic to handle "all" value
      const matchesStatus = !filters.status || filters.status === "all" || user.status === filters.status;
      const matchesPosition = !filters.position || filters.position === "all" || user.position === filters.position;
      const matchesDepartment = !filters.department || filters.department === "all" || user.department === filters.department;
      
      const userDate = user.dateCreated ? new Date(user.dateCreated) : null;
      const matchesDateFrom = !filters.dateFrom || (userDate && userDate >= filters.dateFrom);
      const matchesDateTo = !filters.dateTo || (userDate && userDate <= filters.dateTo);
      
      return matchesSearch && matchesStatus && matchesPosition && matchesDepartment && matchesDateFrom && matchesDateTo;
    });

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
          case 'email':
            aValue = (a.email || '').toLowerCase();
            bValue = (b.email || '').toLowerCase();
            break;
          case 'position':
            aValue = (a.position || '').toLowerCase();
            bValue = (b.position || '').toLowerCase();
            break;
          case 'department':
            aValue = (a.department || '').toLowerCase();
            bValue = (b.department || '').toLowerCase();
            break;
          case 'dateCreated':
            aValue = a.dateCreated ? new Date(a.dateCreated).getTime() : 0;
            bValue = b.dateCreated ? new Date(b.dateCreated).getTime() : 0;
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

    return filtered;
  }, [users, searchTerm, filters, sortConfig]);

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
          <Button 
            variant={activeFiltersCount > 0 ? "default" : "outline"} 
            size="icon" 
            onClick={() => setIsFilterDialogOpen(true)}
            className={activeFiltersCount > 0 ? "bg-primary" : ""}
          >
            <Filter className={`h-4 w-4 ${activeFiltersCount > 0 ? "text-white" : ""}`} />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white">
                {activeFiltersCount}
              </span>
            )}
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
                onClick={() => handleSort('email')}
              >
                <div className="flex items-center gap-2">
                  Email
                  {getSortIcon('email')}
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
              <TableHead>Statut</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50 select-none"
                onClick={() => handleSort('dateCreated')}
              >
                <div className="flex items-center gap-2">
                  Date de Création
                  {getSortIcon('dateCreated')}
                </div>
              </TableHead>
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
            ) : error ? (
              // Error state
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6 text-red-500">
                  {error}
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              // No users state
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
                  onDelete={handleDelete}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialogs */}
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
        availableDepartments={uniqueDepartments}
        availablePositions={uniquePositions}
      />
    </div>
  );
};

export default UserTable;
