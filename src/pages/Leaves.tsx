
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/utils/apiClient';
import HRISNavbar from '@/components/hris/HRISNavbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; 
import { Search } from 'lucide-react';
import LeaveStatsSection from '@/components/leaves/LeaveStatsSection';
import LeaveTable from '@/components/leaves/LeaveTable';
import LeaveRequestForm from '@/components/leaves/LeaveRequestForm';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';

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
  requester?: string;
  reason?: string;
}

const fetchLeaveStats = async (filter: string): Promise<LeaveStats> => {
  // Mock data for now - would be replaced with actual API calls
  if (filter === 'self') {
    return {
      total: 30,
      approved: 0,
      pending: 0,
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
  // Mock data for now - would be replaced with actual API calls
  if (filter === 'self') {
    return [
      { 
        id: '001', 
        type: 'Congés légaux', 
        startDate: '01/05/2024', 
        endDate: '10/05/2024', 
        days: 7,
        status: 'approved', 
        hasAttachment: false 
      },
      { 
        id: '002', 
        type: 'Congés sans solde', 
        startDate: '15/05/2024', 
        endDate: '18/05/2024', 
        days: 3,
        status: 'pending', 
        hasAttachment: true 
      }
    ];
  } else {
    return [
      { 
        id: '003', 
        requester: 'Jean Dupont',
        type: 'Congés légaux', 
        startDate: '20/05/2024', 
        endDate: '22/05/2024', 
        days: 3,
        status: 'pending', 
        hasAttachment: true,
        reason: 'Vacances familiales'
      },
      { 
        id: '007', 
        requester: 'Sophie Martin',
        type: 'Congés sans solde', 
        startDate: '01/06/2024', 
        endDate: '15/06/2024', 
        days: 10,
        status: 'pending', 
        hasAttachment: false,
        reason: 'Voyage personnel important'
      }
    ];
  }
};

const Leaves = () => {
  const [activeFilter, setActiveFilter] = useState<string>('self');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { user } = useAuth();
  
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
    setIsDrawerOpen(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFormSubmitSuccess = () => {
    setIsDrawerOpen(false);
    // Optionally refetch the leaves data here
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

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="max-h-[90vh]">
          <div className="flex flex-col h-full">
            <DrawerHeader className="flex-shrink-0">
              <DrawerTitle>Nouvelle demande de congé</DrawerTitle>
              <DrawerDescription>
                Remplissez le formulaire ci-dessous pour soumettre votre demande de congé.
              </DrawerDescription>
            </DrawerHeader>
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <LeaveRequestForm onSubmitSuccess={handleFormSubmitSuccess} />
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default Leaves;
