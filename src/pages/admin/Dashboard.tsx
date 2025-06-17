
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import StatsCards from '@/components/admin/StatsCards';
import UserTable from '@/components/admin/UserTable';
import AddUserCard from '@/components/admin/AddUserCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLeaves from './AdminLeaves';
import AdminEvaluations from './AdminEvaluations';

const Dashboard = () => {
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Tableau de Bord Administrateur</h1>
        
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Tableau de Bord</TabsTrigger>
            <TabsTrigger value="leaves">Congés</TabsTrigger>
            <TabsTrigger value="evaluations">Evaluations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="mt-6">
            <StatsCards />
            <div className="flex flex-col xl:flex-row gap-6 mt-6">
              <div className="flex-1">
                <UserTable />
              </div>
              <div className="w-full xl:w-80">
                <AddUserCard />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="leaves" className="mt-6">
            <AdminLeaves />
          </TabsContent>
          
          <TabsContent value="evaluations" className="mt-6">
            <AdminEvaluations />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
