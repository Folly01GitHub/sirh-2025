
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import WaveBackground from '@/components/ui/WaveBackground';
import LoginForm from '@/components/auth/LoginForm';
import apiClient from '@/utils/apiClient';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  
  // If user is already authenticated, redirect to home
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/home';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async () => {
    if (loading) return; // Prevent multiple submissions
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Attempting login with:', { email });
      
      // Use apiClient instead of direct axios call
      const response = await apiClient.post('/login', {
        email,
        password
      });
      
      console.log('Login response:', response.data);
      
      // Handle successful login and JWT token
      if (response.data && response.data.token) {
        // Pass token and user info to auth context
        login(
          response.data.token, 
          response.data.user || { email }
        );
        
        toast.success("Connexion réussie!");
        
        // Navigate happens in the useEffect because auth state changes
      } else {
        throw new Error('Aucun token reçu du serveur');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // More specific error message based on error status
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401) {
          setError('Identifiants invalides');
        } else if (err.response.status === 403) {
          setError('Compte bloqué ou inactif');
        } else {
          setError('Erreur de connexion au serveur');
        }
      } else {
        setError('Erreur de connexion au serveur');
      }
      
      toast.error("Échec de connexion");
    } finally {
      setLoading(false);
    }
  };

  // Auto-fill test credentials in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setEmail('test@example.com');
      setPassword('securepassword123');
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <WaveBackground />
      
      <div className="z-10 w-full max-w-md">
        <Card className="backdrop-blur-sm border border-gray-100 shadow-lg animate-fade-in-down">
          <div className="p-8">
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-2 rounded-md text-sm animate-slide-down mb-4">
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
              onSubmit={handleSubmit}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
