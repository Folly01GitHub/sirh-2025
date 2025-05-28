import React, { useState, useEffect } from 'react';
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
  status: 'approved' | 'pending' | 'rejected' | 'Niveau responsable' | 'Niveau RH' | 'Annulée' | 'Acceptée' | 'Refusée';
  hasAttachment: boolean;
  requester?: string;
  reason?: string;
  isLegal?: boolean;
}

interface ApiLeaveItem {
  id: string;
  date_debut: string;
  date_fin: string;
  jours_pris: number;
  statut: string;
  isLegal: boolean;
}

interface ApiTeamLeaveItem {
  id: string;
  demandeur: string;
  date_debut: string;
  date_fin: string;
  jours_pris: number;
  statut: string;
  isLegal: boolean;
}

interface ApiLeaveStatsResponse {
  restant: number;
  pris: number;
  anciennete: number;
}

interface ApiTeamLeaveStatsResponse {
  total: number;
  valide: number;
  enAttente: number;
}

const fetchLeaveStats = async (filter: string): Promise<LeaveStats> => {
  if (filter === 'self') {
    try {
      const response = await apiClient.get('/conge-stats');
      console.log('API Response for leave stats:', response.data);
      
      const apiStats: ApiLeaveStatsResponse = response.data;
      
      // Transform API data to match LeaveStats interface
      return {
        total: 30, // This could be calculated as restant + pris or provided by API
        remaining: apiStats.restant,
        used: apiStats.pris,
        seniority: apiStats.anciennete
      };
    } catch (error) {
      console.error('Error fetching leave stats:', error);
      // Return default values on error
      return {
        total: 30,
        remaining: 0,
        used: 0,
        seniority: 0
      };
    }
  } else {
    try {
      const response = await apiClient.get('/conge-team-stats');
      console.log('API Response for team leave stats:', response.data);
      
      const apiTeamStats: ApiTeamLeaveStatsResponse = response.data;
      
      // Transform API data to match LeaveStats interface
      return {
        total: apiTeamStats.total,
        approved: apiTeamStats.valide,
        pending: apiTeamStats.enAttente
      };
    } catch (error) {
      console.error('Error fetching team leave stats:', error);
      // Return default values on error
      return {
        total: 0,
        approved: 0,
        pending: 0
      };
    }
  }
};

const fetchMyLeaves = async (): Promise<LeaveItem[]> => {
  try {
    const response = await apiClient.get('/demandes-conges');
    console.log('API Response for my leaves:', response.data);
    
    // Transform API data to match LeaveItem interface
    const transformedData = response.data.map((item: ApiLeaveItem) => ({
      id: item.id,
      type: item.isLegal ? 'Congés légaux' : 'Congés sans solde',
      startDate: item.date_debut,
      endDate: item.date_fin,
      days: item.jours_pris,
      status: item.statut as LeaveItem['status'],
      hasAttachment: false, // Not provided by API
      isLegal: item.isLegal
    }));
    
    console.log('📝 CACHE DEBUG - My leaves transformed data:', transformedData);
    console.log('📝 CACHE DEBUG - My leaves IDs:', transformedData.map(item => item.id));
    
    return transformedData;
  } catch (error) {
    console.error('Error fetching my leaves:', error);
    return [];
  }
};

const fetchTeamLeaves = async (): Promise<LeaveItem[]> => {
  try {
    const response = await apiClient.get('/demandes-a-valider');
    console.log('API Response for team leaves:', response.data);
    
    // Transform API data to match LeaveItem interface
    const transformedData = response.data.map((item: ApiTeamLeaveItem) => ({
      id: item.id,
      requester: item.demandeur,
      type: item.isLegal ? 'Congés légaux' : 'Congés sans solde',
      startDate: item.date_debut,
      endDate: item.date_fin,
      days: item.jours_pris,
      status: item.statut as LeaveItem['status'],
      hasAttachment: !item.isLegal, // Show attachment for non-legal leaves
      isLegal: item.isLegal
    }));
    
    console.log('📝 CACHE DEBUG - Team leaves transformed data:', transformedData);
    console.log('📝 CACHE DEBUG - Team leaves IDs:', transformedData.map(item => item.id));
    
    return transformedData;
  } catch (error) {
    console.error('Error fetching team leaves:', error);
    return [];
  }
};

const Leaves = () => {
  const [activeFilter, setActiveFilter] = useState<string>('self');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { user } = useAuth();
  const navigate = useNavigate();
  
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
    queryFn: () => activeFilter === 'self' ? fetchMyLeaves() : fetchTeamLeaves(),
    onSuccess: (data) => {
      console.log(`🎯 CACHE DEBUG - Query success for key ['leaves', '${activeFilter}']:`, data);
      console.log(`🎯 CACHE DEBUG - Data cached with ${data.length} items`);
      console.log(`🎯 CACHE DEBUG - All IDs in cache:`, data.map(item => item.id));
    }
  });
  
  const handleFilterChange = (value: string) => {
    setActiveFilter(value);
    setSearchTerm('');
    console.log(`🔄 CACHE DEBUG - Filter changed to: ${value}`);
  };
  
  const handleActionClick = (id: string, action: string) => {
    console.log(`Action ${action} on leave ${id}`);
    console.log(`🔍 CACHE DEBUG - Navigating to details with ID: ${id}`);
    
    if (action === 'view') {
      navigate(`/leave/details?id=${id}`);
    } else {
      // Handle other actions (approve, reject, cancel, download, delete)
    }
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

  // Log cache state whenever component renders
  React.useEffect(() => {
    console.log(`🏪 CACHE DEBUG - Current active filter: ${activeFilter}`);
    console.log(`🏪 CACHE DEBUG - Current leaves data:`, leaves);
    console.log(`🏪 CACHE DEBUG - Leaves loading state:`, leavesLoading);
  }, [activeFilter, leaves, leavesLoading]);

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
              <TabsTrigger value="team">Congés à valider</TabsTrigger>
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
