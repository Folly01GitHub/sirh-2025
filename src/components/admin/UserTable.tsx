
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
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Edit, 
  Trash2, 
  ChevronDown, 
  Download, 
  Filter, 
  Calendar as CalendarIcon,
  Check,
  Clock,
  Search
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

// Mock user data
interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  department: string;
  status: 'active' | 'pending';
  dateCreated: string;
}

const mockUsers: User[] = Array.from({ length: 10 }).map((_, i) => ({
  id: i + 1,
  firstName: `First${i + 1}`,
  lastName: `Last${i + 1}`,
  email: `user${i + 1}@example.com`,
  position: ['Associate', 'Director', 'Manager', 'Senior', 'Trainee'][Math.floor(Math.random() * 5)],
  department: ['HR', 'TDC', 'FA'][Math.floor(Math.random() * 3)],
  status: Math.random() > 0.3 ? 'active' : 'pending',
  dateCreated: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
}));

// Form schema for editing users
const userEditSchema = z.object({
  firstName: z.string().min(2, "Le prénom est requis"),
  lastName: z.string().min(2, "Le nom est requis"),
  email: z.string().email("Adresse email invalide"),
  position: z.string().min(1, "Le poste est requis"),
  department: z.string().min(1, "Le département est requis"),
});

type UserEditFormData = z.infer<typeof userEditSchema>;

// Filter schema
const filterSchema = z.object({
  status: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
});

type FilterFormData = z.infer<typeof filterSchema>;

const UserTable = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterFormData>({});

  // Initialize the form for editing users
  const editForm = useForm<UserEditFormData>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      position: '',
      department: '',
    }
  });

  // Initialize the form for filtering
  const filterForm = useForm<FilterFormData>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      status: '',
      position: '',
      department: '',
      dateFrom: undefined,
      dateTo: undefined,
    }
  });

  // Fetch users (simulate API call)
  useEffect(() => {
    const fetchUsers = async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      setUsers(mockUsers);
      setLoading(false);
    };

    fetchUsers();
  }, []);

  // Handle editing a user
  const handleEdit = (user: User) => {
    setSelectedUser(user);
    editForm.reset({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      position: user.position,
      department: user.department,
    });
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
    filterForm.reset({
      status: '',
      position: '',
      department: '',
      dateFrom: undefined,
      dateTo: undefined,
    });
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

  // Export to CSV
  const exportToCsv = () => {
    const headers = ['ID', 'Prénom', 'Nom', 'Email', 'Poste', 'Département', 'Statut', 'Date de Création'];
    const data = filteredUsers.map(user => [
      user.id,
      user.firstName,
      user.lastName,
      user.email,
      user.position,
      user.department,
      user.status === 'active' ? 'Actif' : 'En attente',
      new Date(user.dateCreated).toLocaleDateString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...data.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'utilisateurs.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        <Button variant="outline" className="gap-2 w-full md:w-auto" onClick={exportToCsv}>
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
                <TableRow key={user.id} className="transition-colors hover:bg-gray-50">
                  <TableCell>{user.id}</TableCell>
                  <TableCell>
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.position}</TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {user.status === 'active' ? (
                        <>
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-green-600">Actif</span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-4 w-4 text-amber-500" />
                          <span className="text-amber-600">En attente</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(user.dateCreated).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEdit(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(user)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
            <DialogDescription>
              Modifier les informations de l'utilisateur
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Poste</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un poste" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {["Associate", "Director", "Senior Manager", "Manager", "Senior", "Assistant", "Trainee"].map((position) => (
                          <SelectItem key={position} value={position}>
                            {position}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Département</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un département" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {["HR", "TDC", "FA"].map((department) => (
                          <SelectItem key={department} value={department}>
                            {department}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Enregistrer les modifications</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action ne peut pas être annulée.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-red-50 p-4 rounded-md border border-red-200 mb-4">
            <p className="text-sm text-red-800">
              Vous êtes sur le point de supprimer : <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong> ({selectedUser?.email})
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Filtrer les utilisateurs</DialogTitle>
            <DialogDescription>
              Appliquer des filtres pour affiner la liste des utilisateurs
            </DialogDescription>
          </DialogHeader>
          <Form {...filterForm}>
            <form onSubmit={filterForm.handleSubmit(applyFilters)} className="space-y-4">
              <Tabs defaultValue="status" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="status" className="flex-1">Statut</TabsTrigger>
                  <TabsTrigger value="role" className="flex-1">Rôle</TabsTrigger>
                  <TabsTrigger value="date" className="flex-1">Date</TabsTrigger>
                </TabsList>
                <TabsContent value="status" className="mt-4">
                  <FormField
                    control={filterForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Statut de l'utilisateur</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Tous les statuts" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Tous les statuts</SelectItem>
                            <SelectItem value="active">Actif</SelectItem>
                            <SelectItem value="pending">En attente</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </TabsContent>
                <TabsContent value="role" className="mt-4 space-y-4">
                  <FormField
                    control={filterForm.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Poste</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Tous les postes" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Tous les postes</SelectItem>
                            {["Associate", "Director", "Senior Manager", "Manager", "Senior", "Assistant", "Trainee"].map((position) => (
                              <SelectItem key={position} value={position}>
                                {position}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={filterForm.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Département</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Tous les départements" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Tous les départements</SelectItem>
                            {["HR", "TDC", "FA"].map((department) => (
                              <SelectItem key={department} value={department}>
                                {department}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </TabsContent>
                <TabsContent value="date" className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={filterForm.control}
                      name="dateFrom"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>De la date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className="w-full pl-3 text-left font-normal"
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span className="text-muted-foreground">Choisir une date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={filterForm.control}
                      name="dateTo"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>À la date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className="w-full pl-3 text-left font-normal"
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span className="text-muted-foreground">Choisir une date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              </Tabs>
              <DialogFooter className="mt-6 gap-2">
                <Button type="button" variant="outline" onClick={resetFilters}>
                  Réinitialiser
                </Button>
                <Button type="submit">Appliquer les filtres</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserTable;
