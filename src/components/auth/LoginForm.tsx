
import React, { useState, Dispatch, SetStateAction } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, AlertCircle } from 'lucide-react';
import PasswordInput from './PasswordInput';

// Form schema with validation
const formSchema = z.object({
  email: z.string().email({ message: 'Veuillez entrer une adresse e-mail valide' }),
  password: z.string().min(1, { message: 'Le mot de passe est requis' }),
  remember: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface LoginFormProps {
  email: string;
  setEmail: Dispatch<SetStateAction<string>>;
  password: string;
  setPassword: Dispatch<SetStateAction<string>>;
  loading: boolean;
  remember: boolean;
  setRemember: Dispatch<SetStateAction<boolean>>;
  onSubmit: () => void;
}

const LoginForm = ({ 
  email, 
  setEmail, 
  password, 
  setPassword, 
  loading, 
  remember, 
  setRemember,
  onSubmit 
}: LoginFormProps) => {
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: email,
      password: password,
      remember: remember,
    },
  });

  const handleFormSubmit = (values: FormValues) => {
    try {
      // Update parent state
      setEmail(values.email);
      setPassword(values.password);
      setRemember(values.remember || false);
      
      // Log submission for debugging
      console.log('Formulaire soumis:', { email: values.email, remember: values.remember });
      
      // Call the parent's onSubmit handler instead of submitting directly
      onSubmit();
      
      setError(null);
      
      // Important: Return false to prevent default form submission
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return false;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Bienvenue</h1>
        <p className="text-gray-500">Veuillez vous connecter pour continuer</p>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center animate-slide-down">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      
      <Form {...form}>
        <form 
          onSubmit={(e) => {
            e.preventDefault(); // Prevent default form submission
            form.handleSubmit(handleFormSubmit)(e);
          }} 
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">E-mail</FormLabel>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <Mail size={18} />
                  </div>
                  <FormControl>
                    <Input 
                      placeholder="nom@exemple.com" 
                      className="pl-10" 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        setEmail(e.target.value);
                      }}
                      disabled={loading}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">Mot de passe</FormLabel>
                <FormControl>
                  <PasswordInput 
                    placeholder="Entrez votre mot de passe" 
                    {...field} 
                    onChange={(e) => {
                      field.onChange(e);
                      setPassword(e.target.value);
                    }}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex items-center justify-between">
            <FormField
              control={form.control}
              name="remember"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        setRemember(!!checked);
                      }}
                      id="remember"
                      disabled={loading}
                    />
                  </FormControl>
                  <label htmlFor="remember" className="text-sm cursor-pointer">Se souvenir de moi</label>
                </FormItem>
              )}
            />
            
            <a href="#" className="text-sm text-primary hover:text-primary/80">
              Mot de passe oublié?
            </a>
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default LoginForm;
