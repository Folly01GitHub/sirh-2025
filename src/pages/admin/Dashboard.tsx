
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import StatsCards from '@/components/admin/StatsCards';

const Dashboard = () => {
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Tableau de Bord Administrateur</h1>
        <StatsCards />
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
