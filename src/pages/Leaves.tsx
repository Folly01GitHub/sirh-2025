
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

const fetchLeaves = async (filter: string, userId?: string): Promise<LeaveItem[]> => {
  console.log('fetchLeaves called with:', { filter, userId });
  
  if (filter === 'self') {
    try {
      // Utiliser l'API pour récupérer les demandes de congés de l'utilisateur
      const response = await apiClient.get('/demandes-conges');
      console.log('API /demandes-conges response:', response.data);
      
      // Mapper les données de l'API vers le format attendu par l'interface
      const mappedData = response.data.map((item: any) => ({
        id: item.id?.toString() || '',
        type: item.isLegal ? 'Congés légaux' : 'Autres congés',
        startDate: item.date_debut || '',
        endDate: item.date_fin || '',
        days: item.jours_pris || 0,
        status: item.statut,
        hasAttachment: false,
        isLegal: item.isLegal || false
      }));
      
      console.log('Mapped data for "Mes congés":', mappedData);
      return mappedData;
    } catch (error) {
      console.error('Error fetching user leaves:', error);
      // Return empty array on error to prevent UI crash
      return [];
    }
  } else {
    try {
      // Récupérer uniquement les demandes à valider via l'API dédiée
      const response = await apiClient.get('/demandes-a-valider');
      console.log('API /demandes-a-valider response:', response.data);
      console.log('Current user ID for filtering:', userId);
      
      // Filtrer pour exclure les demandes de l'utilisateur connecté
      const filteredData = response.data.filter((item: any) => {
        const itemUserId = item.user_id?.toString();
        const currentUserId = userId?.toString();
        console.log('Comparing user IDs:', { itemUserId, currentUserId, shouldExclude: itemUserId === currentUserId });
        return itemUserId !== currentUserId;
      });
      
      console.log('Filtered data for "Congés à valider":', filteredData);
      
      // Mapper les données de l'API vers le format attendu par l'interface
      const mappedData = filteredData.map((item: any) => ({
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
      
      console.log('Final mapped data for "Congés à valider":', mappedData);
      return mappedData;
    } catch (error) {
      console.error('Error fetching team leaves:', error);
      // Return empty array on error to prevent UI crash
      return [];
    }
  }
};

const Leaves = () => {
  const [activeFilter, setActiveFilter] = useState<string>('self');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { user } = useAuth();
  const navigate = useNavigate();
  
  console.log('Current user in Leaves component:', user);
  
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
    isLoading: leavesLoading,
    error: leavesError
  } = useQuery({
    queryKey: ['leaves', activeFilter, user?.id],
    queryFn: () => fetchLeaves(activeFilter, user?.id),
    retry: 1 // Reduce retry attempts for faster feedback
  });
  
  console.log('Query results:', { leaves, leavesLoading, leavesError });
  
  const handleFilterChange = (value: string) => {
    console.log('Filter changed from', activeFilter, 'to', value);
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
        
        {leavesError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-600">
              Erreur lors du chargement des données. Veuillez vous reconnecter.
            </p>
          </div>
        )}
        
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
