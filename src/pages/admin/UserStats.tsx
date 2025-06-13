
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import apiClient from '@/utils/apiClient';
import { User } from '@/types/user.types';

const UserStats = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      
      try {
        const response = await apiClient.get(`/employees/${userId}`);
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleBack = () => {
    navigate('/admin/dashboard');
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 bg-white min-h-screen">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="back" 
            onClick={handleBack}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold">
            Statistiques - {user ? `${user.firstName} ${user.lastName}` : 'Utilisateur'}
          </h1>
        </div>
        
        {user && (
          <div className="bg-white rounded-lg border p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">Informations générales</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Email:</span> {user.email}
              </div>
              <div>
                <span className="font-medium">Poste:</span> {user.position}
              </div>
              <div>
                <span className="font-medium">Département:</span> {user.department}
              </div>
              <div>
                <span className="font-medium">Statut:</span> {user.status === 'active' ? 'Actif' : 'En attente'}
              </div>
            </div>
          </div>
        )}
        
        <div className="text-center text-gray-500 mt-12">
          <p>Page de statistiques en cours de développement</p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UserStats;
