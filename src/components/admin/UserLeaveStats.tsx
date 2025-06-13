
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarDays, Clock, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import apiClient from '@/utils/apiClient';

interface UserLeaveStatsProps {
  userId?: string;
}

interface LeaveStatsData {
  remainingDays: number;
  daysUsed: number;
  pendingRequests: number;
}

const UserLeaveStats: React.FC<UserLeaveStatsProps> = ({ userId }) => {
  const [leaveStats, setLeaveStats] = useState<LeaveStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaveStats = async () => {
      if (!userId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await apiClient.get(`/admin/conges/stats?user_id=${userId}`);
        console.log('Leave stats API response:', response.data);
        setLeaveStats(response.data);
      } catch (err) {
        console.error('Error fetching leave stats:', err);
        setError('Impossible de charger les statistiques de congés');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveStats();
  }, [userId]);

  if (loading) {
    return (
      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span className="text-2xl">🏖️</span>
          Gestion des Congés
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span className="text-2xl">🏖️</span>
          Gestion des Congés
        </h2>
        
        <div className="text-center py-12">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Erreur de chargement</h3>
          <p className="text-gray-500">{error}</p>
        </div>
      </section>
    );
  }

  if (!leaveStats) {
    return (
      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span className="text-2xl">🏖️</span>
          Gestion des Congés
        </h2>
        
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Aucune donnée</h3>
          <p className="text-gray-500">Les statistiques de congés ne sont pas disponibles.</p>
        </div>
      </section>
    );
  }

  const statsCards = [
    {
      title: 'Solde congés',
      value: `${leaveStats.remainingDays} jours`,
      icon: <MapPin className="h-6 w-6 text-white" />,
      color: 'bg-green-500',
      emoji: '🏝️'
    },
    {
      title: 'Jours pris',
      value: `${leaveStats.daysUsed} jours`,
      icon: <CalendarDays className="h-6 w-6 text-white" />,
      color: 'bg-amber-500',
      emoji: '📅'
    },
    {
      title: 'Demandes en attente',
      value: `${leaveStats.pendingRequests} demandes`,
      icon: <Clock className="h-6 w-6 text-white" />,
      color: 'bg-blue-500',
      emoji: '⏳'
    }
  ];

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span className="text-2xl">🏖️</span>
        Gestion des Congés
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
                <div className={`p-2 rounded-full ${stat.color} shadow-md`}>
                  {stat.icon}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{stat.emoji}</span>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default UserLeaveStats;
