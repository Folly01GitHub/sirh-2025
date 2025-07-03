
import React from 'react';
import { CalendarDays, CheckCircle, Clock, Trophy } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import StatsCard from '@/components/hris/StatsCard';

interface LeaveStats {
  total: number;
  approved?: number;
  pending?: number;
  remaining?: number;
  used?: number;
  seniority?: number;
}

interface LeaveStatsSectionProps {
  stats?: LeaveStats;
  isLoading: boolean;
  activeFilter: string;
}

const LeaveStatsSection: React.FC<LeaveStatsSectionProps> = ({ 
  stats,
  isLoading,
  activeFilter
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            <Skeleton className="h-4 w-24 mb-4" />
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  if (activeFilter === 'self') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <StatsCard
          title="Congés restants"
          value={`${stats.remaining || 0} jours`}
          icon={<CalendarDays className="h-6 w-6 text-blue-600" />}
          color="blue"
          description="Solde disponible"
        />
        <StatsCard
          title="Jours pris"
          value={`${stats.used || 0} jours`}
          icon={<CheckCircle className="h-6 w-6 text-green-600" />}
          color="green"
          description="Jours de congés utilisés cette année"
        />
        <StatsCard
          title="Congés d'ancienneté"
          value={`${stats.seniority || 0} jours`}
          icon={<Trophy className="h-6 w-6 text-amber-600" />}
          color="amber"
          description="Jours en plus pour votre ancienneté"
        />
      </div>
    );
  } else {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <StatsCard
          title="Demandes totales"
          value={stats.total.toString()}
          icon={<CalendarDays className="h-6 w-6 text-blue-600" />}
          color="blue"
          description="Total des demandes"
        />
        <StatsCard
          title="Demandes validées"
          value={stats.approved?.toString() || '0'}
          icon={<CheckCircle className="h-6 w-6 text-green-600" />}
          color="green"
          description="Demandes approuvées"
        />
        <StatsCard
          title="Demandes en attente"
          value={stats.pending?.toString() || '0'}
          icon={<Clock className="h-6 w-6 text-amber-600" />}
          color="amber"
          description="En attente de validation"
        />
      </div>
    );
  }
};

export default LeaveStatsSection;
