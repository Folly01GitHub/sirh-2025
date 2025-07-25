
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarDays, Clock, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import apiClient from '@/utils/apiClient';

interface UserLeaveStatsProps {
  userId?: string;
}

interface LeaveStatsData {
  jours_legaux_pris_annee: number;
  nombre_demandes_en_attente: number;
  solde_conges_legaux: string;
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
          Gestion des Congés
        </h2>
        
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Aucune donnée</h3>
          <p className="text-gray-500">Les statistiques de congés ne sont pas disponibles.</p>
        </div>
      </section>
    );
  }

  const statsCards = [
    {
      title: 'Solde congés',
      value: `${leaveStats.solde_conges_legaux} jours`,
      icon: <MapPin className="h-6 w-6 text-blue-600" />,
      color: 'blue'
    },
    {
      title: 'Jours pris',
      value: `${leaveStats.jours_legaux_pris_annee} jours`,
      icon: <CalendarDays className="h-6 w-6 text-amber-600" />,
      color: 'amber'
    },
    {
      title: 'Demandes en attente',
      value: `${leaveStats.nombre_demandes_en_attente} demandes`,
      icon: <Clock className="h-6 w-6 text-green-600" />,
      color: 'green'
    }
  ];

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        Gestion des Congés
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsCards.map((stat, index) => (
          <Card key={index} className="overflow-hidden transition-all duration-300 hover:shadow-md hover:translate-y-[-4px] group">
            <div className="relative">
              <div className={`absolute inset-0 bg-gradient-to-br ${
                stat.color === 'blue' ? 'from-blue-50 to-blue-100' :
                stat.color === 'amber' ? 'from-amber-50 to-amber-100' :
                'from-green-50 to-green-100'
              } opacity-50 group-hover:opacity-70 transition-opacity`}></div>
              
              <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] group-hover:backdrop-blur-[1px] transition-all"></div>
              
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center border ${
                    stat.color === 'blue' ? 'border-blue-200 bg-blue-500/10' :
                    stat.color === 'amber' ? 'border-amber-200 bg-amber-500/10' :
                    'border-green-200 bg-green-500/10'
                  }`}>
                    {stat.icon}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default UserLeaveStats;
