import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/utils/apiClient';
import HRISNavbar from '@/components/hris/HRISNavbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; 
import { Search } from 'lucide-react';
import LeaveStatsSection from '@/components/leaves/LeaveStatsSection';
import LeaveTable from '@/components/leaves/LeaveTable';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LeaveStats {
  total: number;
  approved?: number;
  pending?: number;
  remaining?: number;
  used?: number;
  seniority?: number;
}

interface LeaveItem {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: 'approved' | 'pending' | 'rejected';
  hasAttachment: boolean;
  isLegal: boolean;
  requester?: string;
  reason?: string;
}

const fetchLeaveStats = async (filter: string): Promise<LeaveStats> => {
  // Mock data for now - would be replaced with actual API calls
  if (filter === 'self') {
    return {
      total: 30,
      remaining: 12,
      used: 8,
      seniority: 10
    };
  } else {
    return {
      total: 15,
      approved: 8,
      pending: 7
    };
  }
};

const fetchLeaves = async (filter: string): Promise<LeaveItem[]> => {
  if (filter === 'self') {
    // Utiliser l'API pour récupérer les demandes de congés de l'utilisateur
    const response = await apiClient.get('/demandes-conges');
    
    // Mapper les données de l'API vers le format attendu par l'interface
    return response.data.map((item: any) => ({
      id: item.id?.toString() || '',
      type: item.isLegal ? 'Congés légaux' : 'Autres congés',
      startDate: item.date_debut || '',
      endDate: item.date_fin || '',
      days: item.jours_pris || 0,
      status: item.statut,
      hasAttachment: false,
      isLegal: item.isLegal || false
    }));
  } else {
    // Récupérer uniquement les demandes à valider via l'API dédiée
    const response = await apiClient.get('/demandes-a-valider');
    
    // Mapper les données de l'API vers le format attendu par l'interface
    return response.data.map((item: any) => ({
      id: item.id?.toString() || '',
      requester: item.demandeur || '',
      type: item.isLegal ? 'Congés légaux' : 'Autres congés',
      startDate: item.date_debut || '',
      endDate: item.date_fin || '',
      days: item.jours_pris || 0,
      status: item.statut || 'pending',
      hasAttachment: false,
      isLegal: item.isLegal || false,
      reason: ''
    }));
  }
};

const Leaves = () => {
  const [activeFilter, setActiveFilter] = useState<string>('self');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Determine if the user is a manager to show the validations section
  const isManager = user?.role === 'admin' || user?.isManager;
  
  const { 
    data: stats,
    isLoading: statsLoading 
  } = useQuery({
    queryKey: ['leaveStats', activeFilter],
    queryFn: () => fetchLeaveStats(activeFilter)
  });
  
  const {
    data: leaves,
    isLoading: leavesLoading
  } = useQuery({
    queryKey: ['leaves', activeFilter],
    queryFn: () => fetchLeaves(activeFilter)
  });
  
  const handleFilterChange = (value: string) => {
    setActiveFilter(value);
    setSearchTerm('');
  };
  
  const handleActionClick = (id: string, action: string) => {
    console.log(`Action ${action} on leave ${id}`);
    // Handle different actions based on the action type
  };
  
  const handleNewLeaveRequest = () => {
    navigate('/leave/request');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredLeaves = React.useMemo(() => {
    if (!leaves || !searchTerm.trim()) {
      return leaves;
    }
    
    const term = searchTerm.toLowerCase();
    return leaves.filter(leave => {
      return (
        leave.type?.toLowerCase().includes(term) ||
        leave.startDate?.toLowerCase().includes(term) ||
        leave.endDate?.toLowerCase().includes(term) ||
        leave.requester?.toLowerCase().includes(term) ||
        leave.status?.toLowerCase().includes(term)
      );
    });
  }, [leaves, searchTerm]);

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fc]">
      <HRISNavbar />
      
      <div className="container mx-auto p-4 md:p-6 lg:p-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Gestion des Congés</h1>
            <p className="text-gray-500">Gérez vos congés et validez les demandes de vos collaborateurs</p>
          </div>
          <Button 
            className="mt-4 md:mt-0" 
            onClick={handleNewLeaveRequest}
          >
            Nouvelle demande
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex justify-center">
          <Tabs
            defaultValue="self"
            value={activeFilter}
            onValueChange={handleFilterChange}
            className="w-full md:w-auto"
          >
            <TabsList className="grid w-full md:w-[400px] grid-cols-2">
              <TabsTrigger value="self">Mes congés</TabsTrigger>
              {isManager && <TabsTrigger value="team">Congés à valider</TabsTrigger>}
            </TabsList>
          </Tabs>
        </div>
        
        <LeaveStatsSection 
          stats={stats}
          isLoading={statsLoading}
          activeFilter={activeFilter}
        />
        
        <div className="mb-4 relative">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Rechercher une demande de congé..." 
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-9"
            />
          </div>
        </div>
        
        <LeaveTable 
          leaves={filteredLeaves || []}
          isLoading={leavesLoading}
          activeFilter={activeFilter}
          onActionClick={handleActionClick}
        />
      </div>
    </div>
  );
};

export default Leaves;
