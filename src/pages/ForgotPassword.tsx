import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock } from 'lucide-react';
import WaveBackground from '@/components/ui/WaveBackground';

const passwordSchema = z.object({
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
});

type PasswordForm = z.infer<typeof passwordSchema>;

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  const form = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data: PasswordForm) => {
    if (!token) {
      toast.error("Lien de réinitialisation invalide");
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://backend.local.com/api/changepassword', {
        token,
        password: data.password
      });

      toast.success("Mot de passe réinitialisé avec succès !");
      
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      console.error("Erreur de réinitialisation du mot de passe:", error);
      toast.error("Échec de la réinitialisation du mot de passe. Veuillez réessayer ou demander un nouveau lien.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <WaveBackground />
      
      <Card className="w-full max-w-md glass-card animate-fade-in z-10">
        <CardHeader>
          <CardTitle className="text-2xl">Réinitialisation du mot de passe</CardTitle>
          <CardDescription>Définissez votre nouveau mot de passe pour accéder à votre compte</CardDescription>
        </CardHeader>
        <CardContent>
          {!token ? (
            <div className="text-center p-4">
              <p className="text-red-500 mb-2">Lien de réinitialisation invalide ou expiré</p>
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
                      <FormLabel>Nouveau mot de passe</FormLabel>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                          <Lock size={18} />
                        </div>
                        <FormControl>
                          <Input type="password" className="pl-10" placeholder="Entrez votre nouveau mot de passe" {...field} />
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
                  {loading ? "Réinitialisation en cours..." : "Réinitialiser le mot de passe"}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
