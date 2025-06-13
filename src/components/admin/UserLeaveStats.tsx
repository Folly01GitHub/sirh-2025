
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarDays, Clock, MapPin } from 'lucide-react';

interface UserLeaveStatsProps {
  userId?: string;
}

const UserLeaveStats: React.FC<UserLeaveStatsProps> = ({ userId }) => {
  // Ces données seraient normalement récupérées depuis une API
  const leaveStats = {
    remainingDays: 22,
    daysUsed: 8,
    pendingRequests: 2
  };

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
