
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User as UserIcon } from 'lucide-react';
import apiClient from '@/utils/apiClient';
import { User } from '@/types/user.types';
import UserLeaveStats from '@/components/admin/UserLeaveStats';
import UserEvaluationStats from '@/components/admin/UserEvaluationStats';

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
      <div className="p-6 bg-gradient-to-br from-white to-gray-50 min-h-screen">
        {/* Navigation */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="back" 
            onClick={handleBack}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </div>

        {/* Employee Header */}
        <div className="employee-header text-center mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <UserIcon className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">
              Profil de <span className="text-primary">{user ? `${user.firstName} ${user.lastName}` : 'Utilisateur'}</span>
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            {user?.position || 'Poste non défini'} | {user?.department || 'Département non défini'}
          </p>
        </div>

        <div className="max-w-7xl mx-auto space-y-12">
          {/* Section Congés */}
          <UserLeaveStats userId={userId} />

          {/* Section Évaluations */}
          <UserEvaluationStats userId={userId} />
        </div>
      </div>
    </AdminLayout>
  );
};

export default UserStats;
