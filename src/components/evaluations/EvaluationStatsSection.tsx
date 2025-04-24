
import React from 'react';
import { BarChart4, CheckCircle, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import StatsCard from '@/components/hris/StatsCard';

interface EvaluationStats {
  total: number;
  validees: number;
  en_cours: number;
}

interface EvaluationStatsSectionProps {
  stats?: EvaluationStats;
  isLoading: boolean;
  activeFilter: string;
}

const EvaluationStatsSection: React.FC<EvaluationStatsSectionProps> = ({ 
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
      <StatsCard
        title={activeFilter === 'self' ? "Mes évaluations" : "Évaluations"}
        value={stats.total.toString()}
        icon={<BarChart4 className="h-6 w-6 text-blue-600" />}
        color="blue"
        description="Total des évaluations"
      />
      <StatsCard
        title="Évaluations validées"
        value={stats.validees.toString()}
        icon={<CheckCircle className="h-6 w-6 text-green-600" />}
        color="green"
        description="Processus terminés"
      />
      <StatsCard
        title="Évaluations en cours"
        value={stats.en_cours.toString()}
        icon={<Clock className="h-6 w-6 text-amber-600" />}
        color="amber"
        description="En attente de validation"
      />
    </div>
  );
};

export default EvaluationStatsSection;
