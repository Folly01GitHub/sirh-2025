
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Calendar as CalendarIcon, Award, Clock } from 'lucide-react';
import HRISNavbar from '@/components/hris/HRISNavbar';
import StatsCard from '@/components/hris/StatsCard';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/utils/apiClient';

interface GlobalStats {
  solde_conges_legaux: number;
  evaluations_terminees: number;
  total_evaluations: number;
  total_evenements: number;
}

interface ApiEvent {
  date: string;
  libelle: string;
  type: string;
}

const fetchGlobalStats = async (): Promise<GlobalStats> => {
  try {
    const response = await apiClient.get('/global-stats');
    console.log('API Response for global stats:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching global stats:', error);
    // Return default values in case of error
    return {
      solde_conges_legaux: 0,
      evaluations_terminees: 0,
      total_evaluations: 0,
      total_evenements: 0
    };
  }
};

const fetchUpcomingEvents = async (): Promise<ApiEvent[]> => {
  try {
    const response = await apiClient.get('/evenement/proche');
    console.log('API Response for upcoming events:', response.data);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    return [];
  }
};

const Home = () => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(today);
  const { user } = useAuth();
  
  const { 
    data: globalStats,
    isLoading: statsLoading 
  } = useQuery({
    queryKey: ['globalStats'],
    queryFn: fetchGlobalStats
  });

  const { 
    data: apiEvents = [],
    isLoading: eventsLoading 
  } = useQuery({
    queryKey: ['upcomingEvents'],
    queryFn: fetchUpcomingEvents
  });
  
  const isDayWithEvent = (date: Date) => {
    return apiEvents.some(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === date.getDate() && 
             eventDate.getMonth() === date.getMonth() && 
             eventDate.getFullYear() === date.getFullYear();
    });
  };

  const dashboardUrl = user?.role === 'admin' ? '/admin/dashboard' : '/dashboard';

  const renderStatsCards = () => {
    if (statsLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-32"></div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatsCard 
          title="Congés restants" 
          value={`${globalStats?.solde_conges_legaux || 0} jours`} 
          icon={<CalendarIcon className="h-6 w-6 text-blue-600" />}
          color="blue"
          description="Solde annuel disponible"
        />
        
        <StatsCard 
          title="Évaluations" 
          value={`${globalStats?.evaluations_terminees || 0}/${globalStats?.total_evaluations || 0}`} 
          icon={<Award className="h-6 w-6 text-amber-600" />}
          color="amber"
          description="Évaluations terminées / totales"
        />
        
        <StatsCard 
          title="Événements à venir" 
          value={`${globalStats?.total_evenements || 0} événements`} 
          icon={<Clock className="h-6 w-6 text-green-600" />}
          color="green"
          description="Prochains jours à noter"
        />
      </div>
    );
  };

  const getEventIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'reunion':
        return <Clock className="h-5 w-5" />;
      case 'evaluation':
        return <Award className="h-5 w-5" />;
      case 'conge':
        return <CalendarIcon className="h-5 w-5" />;
      case 'entretien':
        return <Award className="h-5 w-5" />;
      case 'ferie':
        return <CalendarIcon className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getEventBadgeVariant = (type: string) => {
    switch (type.toLowerCase()) {
      case 'reunion':
        return 'default';
      case 'evaluation':
        return 'secondary';
      case 'conge':
        return 'outline';
      case 'entretien':
        return 'destructive';
      case 'ferie':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case 'reunion':
        return 'Réunion';
      case 'evaluation':
        return 'Évaluation';
      case 'conge':
        return 'Congé';
      case 'entretien':
        return 'Entretien';
      case 'ferie':
        return 'Férié';
      default:
        return type;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fc]">
      <HRISNavbar />
      
      <div className="container max-w-6xl mx-auto px-6 py-6 lg:px-12">
        {user?.role === 'admin' && (
          <div className="flex justify-end mb-6">
            <Button 
              size="sm" 
              className="group transition-all duration-300"
              asChild
            >
              <Link to={dashboardUrl}>
                Portail d'administration
                <ChevronRight className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3">
            <h2 className="text-2xl font-semibold text-[#172b4d] mb-4">Votre aperçu</h2>
            {renderStatsCards()}
          </div>

          <div className="lg:col-span-3">
            <h2 className="text-2xl font-semibold text-[#172b4d] mb-4">Votre calendrier</h2>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-3">
                <div className="col-span-1 md:col-span-2 p-6">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                    modifiers={{
                      event: (date) => isDayWithEvent(date),
                    }}
                    modifiersClassNames={{
                      event: "bg-primary/20 font-bold text-primary",
                    }}
                  />
                </div>
                
                <div className="border-t md:border-t-0 md:border-l border-gray-100 p-6">
                  <h3 className="font-medium text-lg mb-4">Événements à venir</h3>
                  <div className="space-y-4">
                    {eventsLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="animate-pulse">
                            <div className="bg-gray-200 rounded-md h-16"></div>
                          </div>
                        ))}
                      </div>
                    ) : apiEvents.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Aucun événement à venir</p>
                      </div>
                    ) : (
                      apiEvents.map((event, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-md transition-colors">
                          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                            {getEventIcon(event.type)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{event.libelle}</h4>
                              <Badge variant={getEventBadgeVariant(event.type)}>
                                {getEventTypeLabel(event.type)}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">
                              {new Date(event.date).toLocaleDateString('fr-FR', { 
                                day: 'numeric',
                                month: 'long', 
                                year: 'numeric' 
                              })}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
