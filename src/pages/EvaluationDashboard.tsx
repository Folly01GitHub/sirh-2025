
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/utils/apiClient';
import HRISNavbar from '@/components/hris/HRISNavbar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import EvaluationStatsSection from '@/components/evaluations/EvaluationStatsSection';
import EvaluationTable from '@/components/evaluations/EvaluationTable';

// Types
interface EvaluationStats {
  total: number;
  validees: number;
  en_cours: number;
}

interface EvaluationItem {
  id: number;
  mission: string;
  code: string;
  date_auto_eval: string;
  date_eval: string;
  date_validation: string;
  evaluateur: string;
  demandeur: string;
  statut: string;
  niveau: 'Evaluateur' | 'Approbateur' | 'Terminé';
}

const fetchEvaluationStats = async (filter: string): Promise<EvaluationStats> => {
  const endpoint = filter === 'self' ? '/self_evaluations/stats' : '/team_evaluations/stats';
  const response = await apiClient.get(endpoint);
  return response.data;
};

const fetchEvaluations = async (filter: string): Promise<EvaluationItem[]> => {
  const endpoint = filter === 'self' ? '/self_evaluations' : '/team_evaluations';
  const response = await apiClient.get(endpoint);
  return response.data;
};

const EvaluationDashboard = () => {
  const [activeFilter, setActiveFilter] = useState<string>('self');
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Fetch statistics data
  const { 
    data: stats,
    isLoading: statsLoading 
  } = useQuery({
    queryKey: ['evaluationStats', activeFilter],
    queryFn: () => fetchEvaluationStats(activeFilter)
  });
  
  // Fetch evaluations list
  const {
    data: evaluations,
    isLoading: evaluationsLoading
  } = useQuery({
    queryKey: ['evaluations', activeFilter],
    queryFn: () => fetchEvaluations(activeFilter)
  });
  
  const handleFilterChange = (value: string) => {
    setActiveFilter(value);
  };
  
  const handleActionClick = (id: number, niveau: string) => {
    // Redirect to the appropriate evaluation step based on the assessment level
    if (activeFilter === 'self') {
      // For self-evaluations, always go to the basic edit form
      navigate(`/evaluation?id=${id}`);
    } else {
      // For team evaluations, direct to the appropriate step based on niveau
      if (niveau === 'Evaluateur') {
        // Step 2: Manager assessment form
        navigate(`/evaluation?id=${id}&step=2`);
      } else if (niveau === 'Approbateur') {
        // Step 3: Approval validation form
        navigate(`/evaluation?id=${id}&step=3`);
      } else {
        // Default fallback to view-only mode for completed evaluations
        navigate(`/evaluation?id=${id}&mode=view`);
      }
    }
  };
  
  const handleNewEvaluation = () => {
    navigate('/evaluation');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fc]">
      <HRISNavbar />
      
      <div className="container mx-auto p-4 md:p-6 lg:p-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Évaluations</h1>
            <p className="text-gray-500">Gérez vos évaluations et celles de vos collaborateurs</p>
          </div>
          <Button 
            className="mt-4 md:mt-0" 
            onClick={handleNewEvaluation}
          >
            Nouvelle évaluation
          </Button>
        </div>
        
        {/* Filter Selector */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <Select 
            value={activeFilter} 
            onValueChange={handleFilterChange}
          >
            <SelectTrigger className="w-full md:w-[280px]">
              <SelectValue placeholder="Choisir une vue" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="self">Mes évaluations</SelectItem>
              <SelectItem value="team">Mes collaborateurs</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Stats Section */}
        <EvaluationStatsSection 
          stats={stats}
          isLoading={statsLoading}
          activeFilter={activeFilter}
        />
        
        {/* Table Section */}
        <EvaluationTable 
          evaluations={evaluations || []}
          isLoading={evaluationsLoading}
          activeFilter={activeFilter}
          onActionClick={handleActionClick}
        />
      </div>
    </div>
  );
};

export default EvaluationDashboard;
