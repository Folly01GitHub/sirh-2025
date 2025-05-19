
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FilterFormData } from '@/types/user.types';
import { filterSchema } from '@/schemas/user.schemas';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { ScrollArea } from '@/components/ui/scroll-area';

interface UserFilterDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: (data: FilterFormData) => void;
  onResetFilters: () => void;
  currentFilters: FilterFormData;
  availableDepartments: string[];
  availablePositions: string[];
}

const UserFilterDialog: React.FC<UserFilterDialogProps> = ({ 
  isOpen, 
  onOpenChange, 
  onApplyFilters, 
  onResetFilters, 
  currentFilters,
  availableDepartments,
  availablePositions
}) => {
  const [loading, setLoading] = useState(false);
  
  const form = useForm<FilterFormData>({
    resolver: zodResolver(filterSchema),
    defaultValues: currentFilters
  });

  // Update form values when currentFilters changes
  React.useEffect(() => {
    if (isOpen) {
      form.reset(currentFilters);
    }
  }, [currentFilters, form, isOpen]);
  
  // Map array data to options format for SearchableSelect
  const positionOptions = availablePositions.map(position => ({
    label: position,
    value: position
  }));
  
  // Ensure "TDC" department is included in the list
  const departments = [...availableDepartments];
  if (!departments.includes("TDC")) {
    departments.push("TDC");
  }
  
  const departmentOptions = departments.map(department => ({
    label: department,
    value: department
  }));

  // Change empty string to "all" for "All" selections
  positionOptions.unshift({ label: "Tous les postes", value: "all" });
  departmentOptions.unshift({ label: "Tous les départements", value: "all" });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] sm:max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Filtrer les utilisateurs</DialogTitle>
          <DialogDescription>
            Appliquer des filtres pour affiner la liste des utilisateurs
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onApplyFilters)} className="space-y-4">
            <Tabs defaultValue="status" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="status" className="flex-1">Statut</TabsTrigger>
                <TabsTrigger value="role" className="flex-1">Rôle</TabsTrigger>
                <TabsTrigger value="date" className="flex-1">Date</TabsTrigger>
              </TabsList>
              <TabsContent value="status" className="mt-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Statut de l'utilisateur</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Tous les statuts" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">Tous les statuts</SelectItem>
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
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Poste</FormLabel>
                      <SearchableSelect
                        value={field.value || ""}
                        onChange={field.onChange}
                        options={positionOptions}
                        placeholder="Tous les postes"
                        loading={loading}
                        disabled={loading}
                      />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Département</FormLabel>
                      <ScrollArea className="h-[170px] rounded-md border p-0">
                        <SearchableSelect
                          value={field.value || ""}
                          onChange={field.onChange}
                          options={departmentOptions}
                          placeholder="Tous les départements"
                          loading={loading}
                          disabled={loading}
                        />
                      </ScrollArea>
                    </FormItem>
                  )}
                />
              </TabsContent>
              <TabsContent value="date" className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
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
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
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
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>
            <DialogFooter className="mt-6 gap-2">
              <Button type="button" variant="outline" onClick={onResetFilters}>
                Réinitialiser
              </Button>
              <Button type="submit">Appliquer les filtres</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UserFilterDialog;
