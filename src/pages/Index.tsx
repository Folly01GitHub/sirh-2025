
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import WaveBackground from '@/components/ui/WaveBackground';
import LoginForm from '@/components/auth/LoginForm';

const Index = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dummy validation - replace with real authentication
      if (email === 'admin@example.com' && password === 'password') {
        toast.success("Connexion réussie!");
        // Redirect or set authentication state here
      } else {
        setError('Email ou mot de passe incorrect');
        toast.error("Échec de connexion");
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <WaveBackground />
      
      <div className="z-10 w-full max-w-md">
        <Card className="backdrop-blur-sm border border-gray-100 shadow-lg animate-fade-in-down">
          <div className="p-8">
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Connexion</h1>
              <p className="text-sm text-gray-500">Connectez-vous à votre compte</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-2 rounded-md text-sm animate-slide-down">
                  {error}
                </div>
              )}
              
              <LoginForm 
                email={email} 
                setEmail={setEmail} 
                password={password} 
                setPassword={setPassword} 
                loading={loading}
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember" 
                    checked={remember} 
                    onCheckedChange={() => setRemember(!remember)}
                  />
                  <label 
                    htmlFor="remember" 
                    className="text-sm text-gray-500 cursor-pointer select-none"
                  >
                    Se souvenir de moi
                  </label>
                </div>
                <Link to="/" className="text-sm font-medium text-primary hover:text-primary/80">
                  Mot de passe oublié ?
                </Link>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? 'Connexion en cours...' : 'Se connecter'}
              </Button>
              
              <div className="mt-6 text-center text-sm text-gray-500">
                Pas encore de compte?{' '}
                <Link to="/register" className="font-medium text-primary hover:text-primary/80">
                  Créer un compte
                </Link>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
