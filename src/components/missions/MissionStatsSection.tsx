
import React from 'react';
import StatsCard from '@/components/hris/StatsCard';
import { Briefcase, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface MissionStats {
  total: number;
  validated?: number;
  pending?: number;
  toValidate?: number;
}

interface MissionStatsSectionProps {
  stats: MissionStats | undefined;
  isLoading: boolean;
  activeFilter: string;
}

const MissionStatsSection = ({ stats, isLoading, activeFilter }: MissionStatsSectionProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-32"></div>
          </div>
        ))}
      </div>
    );
  }

  const renderSelfStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatsCard
        title="Total missions"
        value={stats?.total?.toString() || '0'}
        icon={<Briefcase className="h-5 w-5 text-blue-600" />}
        color="blue"
        description="Nombre total de missions"
      />
      <StatsCard
        title="Missions validées"
        value={stats?.validated?.toString() || '0'}
        icon={<CheckCircle className="h-5 w-5 text-green-600" />}
        color="green"
        description="Missions approuvées"
      />
      <StatsCard
        title="Missions en attente"
        value={stats?.pending?.toString() || '0'}
        icon={<Clock className="h-5 w-5 text-amber-600" />}
        color="amber"
        description="En attente de validation"
      />
    </div>
  );

  const renderTeamStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatsCard
        title="Total missions"
        value={stats?.total?.toString() || '0'}
        icon={<Briefcase className="h-5 w-5 text-blue-600" />}
        color="blue"
        description="Nombre total de missions"
      />
      <StatsCard
        title="Missions validées"
        value={stats?.validated?.toString() || '0'}
        icon={<CheckCircle className="h-5 w-5 text-green-600" />}
        color="green"
        description="Missions déjà validées"
      />
      <StatsCard
        title="Missions à traiter"
        value={stats?.toValidate?.toString() || '0'}
        icon={<AlertCircle className="h-5 w-5 text-red-600" />}
        color="red"
        description="En attente de traitement"
      />
    </div>
  );

  return activeFilter === 'self' ? renderSelfStats() : renderTeamStats();
};

export default MissionStatsSection;
