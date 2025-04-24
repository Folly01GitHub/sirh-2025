import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/utils/apiClient';
import HRISNavbar from '@/components/hris/HRISNavbar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, ChevronLeft, ChevronRight, BarChart4, CheckCircle, Clock } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import StatsCard from '@/components/hris/StatsCard';
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

const fetchEvaluations = async (filter: string, page: number = 1, limit: number = 10): Promise<EvaluationItem[]> => {
  const endpoint = filter === 'self' ? '/self_evaluations' : '/team_evaluations';
  const response = await apiClient.get(endpoint, {
    params: {
      page,
      limit
    }
  });
  return response.data;
};

const EvaluationDashboard = () => {
  const [activeFilter, setActiveFilter] = useState<string>('self');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;
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
    queryKey: ['evaluations', activeFilter, currentPage, itemsPerPage],
    queryFn: () => fetchEvaluations(activeFilter, currentPage, itemsPerPage)
  });
  
  const handleFilterChange = (value: string) => {
    setActiveFilter(value);
    setCurrentPage(1); // Reset to first page on filter change
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handleActionClick = (id: number) => {
    if (activeFilter === 'self') {
      navigate(`/evaluation?id=${id}`);
    } else {
      navigate(`/evaluation?id=${id}&mode=validation`);
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
        
        {/* Pagination */}
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) handlePageChange(currentPage - 1);
                  }}
                  className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Précédent</span>
                </PaginationPrevious>
              </PaginationItem>
              {[...Array(3)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(i + 1);
                    }}
                    isActive={currentPage === i + 1}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < 3) handlePageChange(currentPage + 1);
                  }}
                  className={currentPage >= 3 ? "pointer-events-none opacity-50" : ""}
                >
                  <span>Suivant</span>
                  <ChevronRight className="h-4 w-4" />
                </PaginationNext>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
};

export default EvaluationDashboard;
