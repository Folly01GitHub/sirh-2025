
import React from 'react';
import { Calendar as CalendarIcon, Calendar, Trophy } from 'lucide-react';
import StatsCard from '@/components/hris/StatsCard';

const LeaveStats: React.FC = () => {
  // Ces données seraient normalement récupérées depuis une API
  const remainingDays = 12;
  const totalDays = 30;
  const daysUsed = 8;
  const seniority = "10 jours"; // Changed from "5 ans" to "10 jours"

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <StatsCard
        title="Congés restants"
        value={`${remainingDays} jours`}
        icon={<CalendarIcon className="h-6 w-6 text-blue-600" />}
        color="blue"
        description="Solde disponible"
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
        description="Bonus annuel pour votre ancienneté"
      />
    </div>
  );
};

export default LeaveStats;
