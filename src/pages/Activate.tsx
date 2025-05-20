
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock } from 'lucide-react';
import WaveBackground from '@/components/ui/WaveBackground';
import apiClient from '@/utils/apiClient';

const passwordSchema = z.object({
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
});

type PasswordForm = z.infer<typeof passwordSchema>;

const Activate = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get token from URL query parameter
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  // Effacer tous les cookies au chargement de la page
  useEffect(() => {
    const clearAllCookies = () => {
      const cookies = document.cookie.split(";");
      
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      }
      
      // Pour couvrir différents chemins potentiels
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;

      console.log("Tous les cookies ont été supprimés sur la page d'activation");
    };
    
    clearAllCookies();
    
    // Vider également localStorage et sessionStorage pour plus de sécurité
    localStorage.clear();
    sessionStorage.clear();
  }, []);

  const form = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data: PasswordForm) => {
    if (!token) {
      toast.error("Lien d'activation invalide");
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/activate', {
        token,
        password: data.password
      });

      toast.success("Compte activé avec succès !");
      
      // Redirect to login page after successful activation
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      console.error("Erreur d'activation:", error);
      toast.error("Échec de l'activation. Veuillez réessayer ou contacter l'administrateur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <WaveBackground />
      
      <Card className="w-full max-w-md glass-card animate-fade-in z-10">
        <CardHeader>
          <CardTitle className="text-2xl">Activation du compte</CardTitle>
          <CardDescription>Définissez votre mot de passe pour accéder à votre compte</CardDescription>
        </CardHeader>
        <CardContent>
          {!token ? (
            <div className="text-center p-4">
              <p className="text-red-500 mb-2">Lien d'activation invalide ou expiré</p>
              <Button onClick={() => navigate('/')}>Retour à la page de connexion</Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mot de passe</FormLabel>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                          <Lock size={18} />
                        </div>
                        <FormControl>
                          <Input type="password" className="pl-10" placeholder="Entrez votre mot de passe" {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmer le mot de passe</FormLabel>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                          <Lock size={18} />
                        </div>
                        <FormControl>
                          <Input type="password" className="pl-10" placeholder="Confirmez votre mot de passe" {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? "Activation en cours..." : "Activer le compte"}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Activate;
