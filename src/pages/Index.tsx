
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import WaveBackground from '@/components/ui/WaveBackground';
import LoginForm from '@/components/auth/LoginForm';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    // No need for e.preventDefault() as we're not in a form submit handler anymore
    if (loading) return; // Prevent multiple submissions
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Attempting login with:', { email });
      
      // Call the login API with the new endpoint
      const response = await axios.post('http://backend.local.com/api/login', {
        email,
        password
      });
      
      console.log('Login response:', response.data);
      
      // Handle successful login and JWT token
      if (response.data && response.data.token) {
        // Store JWT token in localStorage
        localStorage.setItem('auth_token', response.data.token);
        
        // Store user info if available
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        toast.success("Connexion réussie!");
        
        // Use setTimeout to ensure the toast is visible before redirecting
        setTimeout(() => {
          // Redirect to home page
          navigate('/home');
        }, 1000); // Increased delay to ensure redirect happens
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

  // Testing with provided credentials
  React.useEffect(() => {
    // Uncomment to auto-fill test credentials
    // setEmail('test@example.com');
    // setPassword('securepassword123');
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
