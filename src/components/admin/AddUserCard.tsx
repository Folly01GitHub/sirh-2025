
import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// Si useAuth est présent dans le projet, utilisez-le, sinon fallback sur localStorage.
import { useAuth } from '@/contexts/AuthContext'; // S'il y a une erreur ici, commentez et utilisez localStorage.

const userSchema = z.object({
  firstName: z.string().min(2, "Le prénom est requis"),
  lastName: z.string().min(2, "Le nom est requis"),
  email: z.string().email("Adresse email invalide"),
  position: z.string().min(1, "Le poste est requis"),
  department: z.string().min(1, "Le département est requis"),
});

type UserFormData = z.infer<typeof userSchema>;

const AddUserCard = () => {
  const [loading, setLoading] = useState(false);
  const [positions, setPositions] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loadingLists, setLoadingLists] = useState(true);
  const { token } = useAuth ? useAuth() : { token: localStorage.getItem('auth_token') };

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      position: '',
      department: '',
    }
  });

  // Fetch lists at mount
  useEffect(() => {
    async function fetchLists() {
      setLoadingLists(true);
      try {
        const headers = token
          ? { Authorization: `Bearer ${token}` }
          : {};

        const [gradesRes, deptsRes] = await Promise.all([
          axios.get('https://10.172.225.11:8082/api/grades', { headers }),
          axios.get('https://10.172.225.11:8082/api/departements', { headers }),
        ]);
        // On tente d'extraire soit la propriété spécifique, soit un tableau racine
        // Pour les postes
        let positions: string[] = [];
        if (gradesRes.data) {
          if (Array.isArray(gradesRes.data)) {
            positions = gradesRes.data;
          } else if (Array.isArray(gradesRes.data.grades)) {
            positions = gradesRes.data.grades;
          }
        }
        // Pour les départements
        let departments: string[] = [];
        if (deptsRes.data) {
          if (Array.isArray(deptsRes.data)) {
            departments = deptsRes.data;
          } else if (Array.isArray(deptsRes.data.departements)) {
            departments = deptsRes.data.departements;
          }
        }
        setPositions(positions);
        setDepartments(departments);
      } catch (err) {
        toast.error('Impossible de charger les listes des postes ou départements.');
      } finally {
        setLoadingLists(false);
      }
    }
    fetchLists();
  }, [token]);

  const onSubmit = async (data: UserFormData) => {
    setLoading(true);
    try {
      await axios.post('http://backend.local.com/api/password', {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        position: data.position,
        department: data.department,
      });
      toast.success("Invitation envoyée avec succès !");
      form.reset();
    } catch (error: any) {
      // Gestion de l'erreur "409"
      if (error.response && error.response.status === 409) {
        toast.error("Adresse email déjà utilisée !");
      } else {
        console.error("Erreur lors de l'envoi de l'invitation:", error);
        toast.error("Échec de l'envoi de l'invitation. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-card animate-hover-float">
      <CardHeader>
        <CardTitle>Ajouter un Nouvel Utilisateur</CardTitle>
        <CardDescription>Envoyer une invitation à un nouvel utilisateur</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prénom</FormLabel>
                  <FormControl>
                    <Input placeholder="Jean" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input placeholder="Dupont" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="jean.dupont@exemple.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Poste</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingLists}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingLists ? "Chargement..." : "Sélectionner un poste"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {positions.length === 0 && !loadingLists && (
                        <SelectItem value="" disabled>
                          Aucune donnée
                        </SelectItem>
                      )}
                      {positions.map((position) => (
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
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Département</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingLists}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingLists ? "Chargement..." : "Sélectionner un département"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.length === 0 && !loadingLists && (
                        <SelectItem value="" disabled>
                          Aucune donnée
                        </SelectItem>
                      )}
                      {departments.map((department) => (
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
            <Button 
              type="submit" 
              className="w-full mt-4"
              disabled={loading || loadingLists}
            >
              {loading ? "Envoi en cours..." : "Envoyer l'invitation"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AddUserCard;
