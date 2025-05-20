
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/utils/apiClient';
import HRISNavbar from '@/components/hris/HRISNavbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; 
import { Search } from 'lucide-react';
import EvaluationStatsSection from '@/components/evaluations/EvaluationStatsSection';
import EvaluationTable from '@/components/evaluations/EvaluationTable';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EvaluationStats {
  total: number;
  validees: number;
  en_cours: number;
}

interface EvaluationItem {
  id: number;
  mission: string;
  client: string;
  code: string;
  date_auto_eval: string;
  date_eval: string;
  date_validation: string;
  evaluateur: string;
  approbateur: string;
  demandeur: string;
  statut: string;
  niveau: 'Evaluateur' | 'Approbateur' | 'Terminé' | 'Auto-évaluation';
  isPencil?: boolean;
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
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { 
    data: stats,
    isLoading: statsLoading 
  } = useQuery({
    queryKey: ['evaluationStats', activeFilter],
    queryFn: () => fetchEvaluationStats(activeFilter)
  });
  
  const {
    data: evaluations,
    isLoading: evaluationsLoading
  } = useQuery({
    queryKey: ['evaluations', activeFilter],
    queryFn: () => fetchEvaluations(activeFilter)
  });
  
  const handleFilterChange = (value: string) => {
    setActiveFilter(value);
    setSearchTerm('');
  };
  
  const handleActionClick = (id: number, niveau: string) => {
    if (activeFilter === 'self') {
      navigate(`/evaluation?id=${id}`);
    } else {
      if (niveau === 'Evaluateur') {
        navigate(`/evaluation?id=${id}&step=2`);
      } else if (niveau === 'Approbateur') {
        navigate(`/evaluation?id=${id}&step=3`);
      } else {
        navigate(`/evaluation?id=${id}`);
      }
    }
  };
  
  const handleNewEvaluation = () => {
    navigate('/evaluation');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredEvaluations = React.useMemo(() => {
    if (!evaluations || !searchTerm.trim()) {
      return evaluations;
    }
    
    const term = searchTerm.toLowerCase();
    return evaluations.filter(eval => {
      return (
        eval.mission?.toLowerCase().includes(term) ||
        eval.client?.toLowerCase().includes(term) ||
        eval.code?.toLowerCase().includes(term) ||
        eval.date_auto_eval?.toLowerCase().includes(term) ||
        eval.date_eval?.toLowerCase().includes(term) ||
        eval.date_validation?.toLowerCase().includes(term) ||
        eval.evaluateur?.toLowerCase().includes(term) ||
        eval.approbateur?.toLowerCase().includes(term) ||
        eval.demandeur?.toLowerCase().includes(term) ||
        eval.statut?.toLowerCase().includes(term) ||
        eval.niveau?.toLowerCase().includes(term)
      );
    });
  }, [evaluations, searchTerm]);

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fc]">
      <HRISNavbar />
      
      <div className="container mx-auto p-4 md:p-6 lg:p-8 animate-fade-in">
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
        
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex justify-center">
          <Tabs
            defaultValue="self"
            value={activeFilter}
            onValueChange={handleFilterChange}
            className="w-full md:w-auto"
          >
            <TabsList className="grid w-full md:w-[400px] grid-cols-2">
              <TabsTrigger value="self">Mes évaluations</TabsTrigger>
              <TabsTrigger value="team">Mes collaborateurs</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <EvaluationStatsSection 
          stats={stats}
          isLoading={statsLoading}
          activeFilter={activeFilter}
        />
        
        <div className="mb-4 relative">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Rechercher une évaluation..." 
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-9"
            />
          </div>
        </div>
        
        <EvaluationTable 
          evaluations={filteredEvaluations || []}
          isLoading={evaluationsLoading}
          activeFilter={activeFilter}
          onActionClick={handleActionClick}
        />
      </div>
    </div>
  );
};

export default EvaluationDashboard;
