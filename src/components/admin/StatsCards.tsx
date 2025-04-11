
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Clock, UserPlus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  color: string;
}

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
  // This would typically come from an API
  const stats = {
    totalUsers: 120,
    activeUsers: 98,
    pendingUsers: 22,
    newThisMonth: 15
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Utilisateurs Totaux"
        value={stats.totalUsers}
        description="Tous les utilisateurs enregistrés"
        icon={<Users className="h-4 w-4 text-white" />}
        color="bg-blue-500"
      />
      <StatCard
        title="Utilisateurs Actifs"
        value={stats.activeUsers}
        description="Utilisateurs avec comptes actifs"
        icon={<UserCheck className="h-4 w-4 text-white" />}
        color="bg-green-500"
      />
      <StatCard
        title="En Attente d'Activation"
        value={stats.pendingUsers}
        description="En attente d'activation du compte"
        icon={<Clock className="h-4 w-4 text-white" />}
        color="bg-amber-500"
      />
      <StatCard
        title="Nouveaux ce Mois"
        value={stats.newThisMonth}
        description="Utilisateurs enregistrés ces 30 derniers jours"
        icon={<UserPlus className="h-4 w-4 text-white" />}
        color="bg-purple-500"
      />
    </div>
  );
};

export default StatsCards;
