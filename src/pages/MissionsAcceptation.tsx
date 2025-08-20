import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/utils/apiClient';
import HRISNavbar from '@/components/hris/HRISNavbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; 
import { Search } from 'lucide-react';
import MissionStatsSection from '@/components/missions/MissionStatsSection';
import MissionTable from '@/components/missions/MissionTable';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MissionStats {
  total: number;
  validated?: number;
  pending?: number;
  toValidate?: number;
}

interface MissionItem {
  id: string;
  code: string;
  title: string;
  client: string;
  startDate: string;
  endDate: string;
  status: 'validated' | 'pending' | 'rejected' | 'en_attente' | 'validee' | 'refusee' | 'Approuvée' | 'En attente' | 'Refusée';
  requester?: string;
}

interface ApiMissionItem {
  id: string;
  code_mission: string;
  libelle_mission: string;
  client: string;
  date_debut: string;
  date_fin: string;
  statut: string;
}

interface ApiTeamMissionItem extends ApiMissionItem {
  demandeur: string;
}

interface ApiMissionStatsResponse {
  total: number;
  validees: number;
  en_attente: number;
}

interface ApiTeamMissionStatsResponse {
  total: number;
  a_valider: number;
  en_attente: number;
}

const fetchMissionStats = async (filter: string): Promise<MissionStats> => {
  if (filter === 'self') {
    try {
      const response = await apiClient.get('/acceptation-stats');
      console.log('API Response for mission stats:', response.data);
      
      const apiStats: ApiMissionStatsResponse = response.data;
      
      return {
        total: apiStats.total,
        validated: apiStats.validees,
        pending: apiStats.en_attente
      };
    } catch (error) {
      console.error('Error fetching mission stats:', error);
      return {
        total: 0,
        validated: 0,
        pending: 0
      };
    }
  } else {
    try {
      const response = await apiClient.get('/acceptation-team-stats');
      console.log('API Response for team mission stats:', response.data);
      
      const apiTeamStats: ApiTeamMissionStatsResponse = response.data;
      
      return {
        total: apiTeamStats.total,
        validated: apiTeamStats.a_valider, // a_valider représente les missions validées
        toValidate: apiTeamStats.en_attente // en_attente représente les missions à traiter
      };
    } catch (error) {
      console.error('Error fetching team mission stats:', error);
      return {
        total: 0,
        validated: 0,
        toValidate: 0,
        pending: 0
      };
    }
  }
};

const fetchMyMissions = async (): Promise<MissionItem[]> => {
  try {
    const response = await apiClient.get('/mes-acceptations');
    console.log('API Response for my missions:', response.data);
    
    return response.data.map((item: ApiMissionItem) => ({
      id: item.id,
      code: item.code_mission,
      title: item.libelle_mission,
      client: item.client,
      startDate: item.date_debut,
      endDate: item.date_fin,
      status: item.statut as MissionItem['status']
    }));
  } catch (error) {
    console.error('Error fetching my missions:', error);
    return [];
  }
};

const fetchTeamMissions = async (): Promise<MissionItem[]> => {
  try {
    const response = await apiClient.get('/acceptation-a-valider');
    console.log('API Response for team missions:', response.data);
    
    return response.data.map((item: ApiTeamMissionItem) => ({
      id: item.id,
      code: item.code_mission,
      title: item.libelle_mission,
      client: item.client,
      startDate: item.date_debut,
      endDate: item.date_fin,
      status: item.statut as MissionItem['status'],
      requester: item.demandeur
    }));
  } catch (error) {
    console.error('Error fetching team missions:', error);
    return [];
  }
};

const MissionsAcceptation = () => {
  const { user } = useAuth();
  
  // All users can see both sections
  const getAvailableTabs = () => {
    return ['self', 'team']; // Both sections for all roles
  };

  const availableTabs = getAvailableTabs();
  
  // Set initial filter based on available tabs
  const getInitialFilter = () => {
    if (user?.role === 'comptable' || user?.role === 'qrm') {
      return 'team';
    } else {
      return 'self';
    }
  };

  const [activeFilter, setActiveFilter] = useState<string>(getInitialFilter());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const navigate = useNavigate();
  
  const { 
    data: stats,
    isLoading: statsLoading 
  } = useQuery({
    queryKey: ['missionStats', activeFilter],
    queryFn: () => fetchMissionStats(activeFilter)
  });
  
  const {
    data: missions,
    isLoading: missionsLoading
  } = useQuery({
    queryKey: ['missions', activeFilter],
    queryFn: () => activeFilter === 'self' ? fetchMyMissions() : fetchTeamMissions()
  });
  
  const handleFilterChange = (value: string) => {
    setActiveFilter(value);
    setSearchTerm('');
  };
  
  const handleActionClick = (id: string, action: string) => {
    console.log(`Action ${action} on mission ${id}`);
    // Handle different actions based on the action type
    // Note: validation and rejection are now handled directly in MissionTable
  };
  
  const handleNewMission = () => {
    navigate('/missions-acceptation/create');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredMissions = React.useMemo(() => {
    if (!missions || !searchTerm.trim()) {
      return missions;
    }
    
    const term = searchTerm.toLowerCase();
    return missions.filter(mission => {
      return (
        mission.code?.toLowerCase().includes(term) ||
        mission.title?.toLowerCase().includes(term) ||
        mission.client?.toLowerCase().includes(term) ||
        mission.startDate?.toLowerCase().includes(term) ||
        mission.endDate?.toLowerCase().includes(term) ||
        mission.requester?.toLowerCase().includes(term) ||
        mission.status?.toLowerCase().includes(term)
      );
    });
  }, [missions, searchTerm]);

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fc]">
      <HRISNavbar />
      
      <div className="container mx-auto p-4 md:p-6 lg:p-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Gestion des Acceptations de Mission</h1>
            <p className="text-gray-500">Gérez vos facturations internes et validez les demandes d'acceptation de mission de vos collaborateurs</p>
          </div>
          {(user?.role === 'collaborateur' || user?.role === 'admin') && (
            <Button 
              className="mt-4 md:mt-0" 
              onClick={handleNewMission}
            >
              Nouvelle demande
            </Button>
          )}
        </div>
        
        {availableTabs.length > 1 && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex justify-center">
            <Tabs
              defaultValue={getInitialFilter()}
              value={activeFilter}
              onValueChange={handleFilterChange}
              className="w-full md:w-auto"
            >
              <TabsList className="grid w-full md:w-[400px] grid-cols-2">
                {availableTabs.includes('self') && (
                  <TabsTrigger value="self">Mes missions</TabsTrigger>
                )}
                {availableTabs.includes('team') && (
                  <TabsTrigger value="team">Missions à valider</TabsTrigger>
                )}
              </TabsList>
            </Tabs>
          </div>
        )}
        
        <MissionStatsSection 
          stats={stats}
          isLoading={statsLoading}
          activeFilter={activeFilter}
        />
        
        <div className="mb-4 relative">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Rechercher une mission..." 
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-9"
            />
          </div>
        </div>
        
        <MissionTable 
          missions={filteredMissions || []}
          isLoading={missionsLoading}
          activeFilter={activeFilter}
          onActionClick={handleActionClick}
          isAcceptationPage={true}
        />
      </div>
    </div>
  );
};

export default MissionsAcceptation;