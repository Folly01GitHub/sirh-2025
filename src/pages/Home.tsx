
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Calendar as CalendarIcon, Award, Clock } from 'lucide-react';
import HRISNavbar from '@/components/hris/HRISNavbar';
import StatsCard from '@/components/hris/StatsCard';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

const Home = () => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(today);
  const { user } = useAuth();
  
  // Sample data - would typically come from API
  const leaveData = {
    remainingDays: 12
  };
  
  const evaluationData = {
    completed: 3,
    total: 5
  };
  
  const events = [
    { date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2), type: 'meeting' },
    { date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5), type: 'appraisal' },
    { date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 8), type: 'leave' },
  ];
  
  const isDayWithEvent = (date: Date) => {
    return events.some(event => 
      event.date.getDate() === date.getDate() && 
      event.date.getMonth() === date.getMonth() && 
      event.date.getFullYear() === date.getFullYear()
    );
  };

  const dashboardUrl = user?.role === 'admin' ? '/admin/dashboard' : '/dashboard';

  const upcomingEventsCount = events.length;

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <StatsCard 
                title="Congés restants" 
                value={`${leaveData.remainingDays} jours`} 
                icon={<CalendarIcon className="h-6 w-6 text-blue-600" />}
                color="blue"
                description="Solde annuel disponible"
              />
              
              <StatsCard 
                title="Évaluations" 
                value={`${evaluationData.completed}/${evaluationData.total}`} 
                icon={<Award className="h-6 w-6 text-amber-600" />}
                color="amber"
                description="Évaluations terminées / totales"
              />
              
              <StatsCard 
                title="Événements à venir" 
                value={`${upcomingEventsCount} événements`} 
                icon={<Clock className="h-6 w-6 text-green-600" />}
                color="green"
                description="Prochains jours à noter"
              />
            </div>
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
                    {events.map((event, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-md transition-colors">
                        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                          {event.type === 'meeting' && <Clock className="h-5 w-5" />}
                          {event.type === 'appraisal' && <Award className="h-5 w-5" />}
                          {event.type === 'leave' && <CalendarIcon className="h-5 w-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">
                              {event.type === 'meeting' && 'Réunion d\'équipe'}
                              {event.type === 'appraisal' && 'Entretien d\'évaluation'}
                              {event.type === 'leave' && 'Jours de congés'}
                            </h4>
                            <Badge variant={
                              event.type === 'meeting' ? 'default' : 
                              event.type === 'appraisal' ? 'secondary' : 'outline'
                            }>
                              {event.type === 'meeting' && 'réunion'}
                              {event.type === 'appraisal' && 'évaluation'}
                              {event.type === 'leave' && 'congé'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">
                            {event.date.toLocaleDateString('fr-FR', { 
                              day: 'numeric',
                              month: 'long', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
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
