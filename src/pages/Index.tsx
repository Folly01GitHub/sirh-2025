
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Call the login API
      const response = await axios.post('http://localhost:8000/api/login', {
        email,
        password
      });
      
      // Handle successful login
      if (response.data) {
        toast.success("Connexion réussie!");
        // Redirect to home page
        navigate('/home');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Identifiants invalides');
      toast.error("Échec de connexion");
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
