
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import StatsCards from '@/components/admin/StatsCards';
import UserTable from '@/components/admin/UserTable';
import AddUserCard from '@/components/admin/AddUserCard';

const Dashboard = () => {
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Tableau de Bord Administrateur</h1>
        <StatsCards />
        <div className="flex flex-col xl:flex-row gap-6 mt-6">
          <div className="flex-1">
            <UserTable />
          </div>
          <div className="w-full xl:w-80">
            <AddUserCard />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
