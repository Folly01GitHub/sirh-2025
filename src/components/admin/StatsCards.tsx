
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Clock, UserPlus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/utils/apiClient';

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface UserStats {
  total_users: number;
  active_users: number;
  pending_activation: number;
  new_this_month: number;
}

const fetchUserStats = async (): Promise<UserStats> => {
  const response = await apiClient.get('/user-stats');
  return response.data;
};

const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon, color }) => (
  <Card className="glass-card">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className={`p-2 rounded-full ${color}`}>
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const StatsCards = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['userStats'],
    queryFn: fetchUserStats
  });

  // Display loading state
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-6 bg-gray-200 animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Display error state
  if (error) {
    console.error('Error fetching user stats:', error);
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-md">
        <p className="text-red-600">Unable to load user statistics.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Utilisateurs Totaux"
        value={stats?.total_users || 0}
        description="Tous les utilisateurs enregistrés"
        icon={<Users className="h-4 w-4 text-white" />}
        color="bg-blue-500"
      />
      <StatCard
        title="Utilisateurs Actifs"
        value={stats?.active_users || 0}
        description="Utilisateurs avec comptes actifs"
        icon={<UserCheck className="h-4 w-4 text-white" />}
        color="bg-green-500"
      />
      <StatCard
        title="En Attente d'Activation"
        value={stats?.pending_activation || 0}
        description="En attente d'activation du compte"
        icon={<Clock className="h-4 w-4 text-white" />}
        color="bg-amber-500"
      />
      <StatCard
        title="Nouveaux ce Mois"
        value={stats?.new_this_month || 0}
        description="Utilisateurs enregistrés ces 30 derniers jours"
        icon={<UserPlus className="h-4 w-4 text-white" />}
        color="bg-purple-500"
      />
    </div>
  );
};

export default StatsCards;
