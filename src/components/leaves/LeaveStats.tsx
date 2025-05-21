
import React from 'react';
import { Umbrella, Calendar, Trophy } from 'lucide-react';
import StatsCard from '@/components/hris/StatsCard';

const LeaveStats: React.FC = () => {
  // Ces données seraient normalement récupérées depuis une API
  const remainingDays = 22;
  const totalDays = 30;
  const daysUsed = 8;
  const seniority = "5 ans";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <StatsCard
        title="Jours restants"
        value={`${remainingDays}/${totalDays}`}
        icon={<Umbrella className="h-5 w-5 text-blue-500" />}
        color="blue"
        description="Congés disponibles pour l'année en cours"
      />
      <StatsCard
        title="Jours pris"
        value={`${daysUsed}`}
        icon={<Calendar className="h-5 w-5 text-green-500" />}
        color="green"
        description="Jours de congés utilisés cette année"
      />
      <StatsCard
        title="Ancienneté"
        value={seniority}
        icon={<Trophy className="h-5 w-5 text-amber-500" />}
        color="amber"
        description="Votre temps de service dans l'entreprise"
      />
    </div>
  );
};

export default LeaveStats;
