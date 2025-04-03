
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
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
                remember={remember}
                setRemember={setRemember}
              />
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
