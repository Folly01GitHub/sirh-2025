
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Briefcase, Calendar as CalendarIcon, Award } from 'lucide-react';
import HRISNavbar from '@/components/hris/HRISNavbar';
import StatsCard from '@/components/hris/StatsCard';
import { Badge } from '@/components/ui/badge';

const Home = () => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(today);
  
  // Sample events for the calendar
  const events = [
    { date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2), type: 'meeting' },
    { date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5), type: 'appraisal' },
    { date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 8), type: 'leave' },
  ];
  
  // Function to highlight dates with events
  const isDayWithEvent = (date: Date) => {
    return events.some(event => 
      event.date.getDate() === date.getDate() && 
      event.date.getMonth() === date.getMonth() && 
      event.date.getFullYear() === date.getFullYear()
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fc]">
      <HRISNavbar />
      
      {/* Hero Section */}
      <section className="relative px-6 py-16 md:py-24 lg:px-12 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 opacity-70"></div>
          <div id="particles-js" className="absolute inset-0"></div>
        </div>
        
        <div className="container max-w-6xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-[#172b4d] mb-4 animate-slide-down">
              Welcome to your HR space
            </h1>
            <p className="text-lg md:text-xl text-[#5e6c84] max-w-2xl mb-8 animate-slide-up">
              Manage your workforce, track performance, and streamline HR processes in one place.
            </p>
            <Button 
              size="lg" 
              className="group transition-all duration-300 transform hover:scale-105 animate-scale-in"
              asChild
            >
              <Link to="/dashboard">
                Go to dashboard
                <ChevronRight className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Statistics Section */}
      <section className="px-6 py-12 lg:px-12">
        <div className="container max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold text-[#172b4d] mb-8">Your Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard 
              title="Leave Remaining" 
              value="12 days" 
              icon={<Calendar className="h-6 w-6 text-blue-600" />}
              color="blue"
              description="Next scheduled: July 15-22"
            />
            
            <StatsCard 
              title="Missions in Progress" 
              value="3 projects" 
              icon={<Briefcase className="h-6 w-6 text-amber-600" />}
              color="amber"
              description="2 due this month"
            />
            
            <StatsCard 
              title="Upcoming Appraisals" 
              value="1 review" 
              icon={<Award className="h-6 w-6 text-green-600" />}
              color="green"
              description="Scheduled for August 10"
            />
          </div>
        </div>
      </section>
      
      {/* Calendar Section */}
      <section className="px-6 py-12 lg:px-12 bg-white">
        <div className="container max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold text-[#172b4d] mb-8">Your Calendar</h2>
          
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
                <h3 className="font-medium text-lg mb-4">Upcoming Events</h3>
                <div className="space-y-4">
                  {events.map((event, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-md transition-colors">
                      <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                        {event.type === 'meeting' && <Briefcase className="h-5 w-5" />}
                        {event.type === 'appraisal' && <Award className="h-5 w-5" />}
                        {event.type === 'leave' && <CalendarIcon className="h-5 w-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">
                            {event.type === 'meeting' && 'Team Meeting'}
                            {event.type === 'appraisal' && 'Performance Review'}
                            {event.type === 'leave' && 'Vacation Days'}
                          </h4>
                          <Badge variant={
                            event.type === 'meeting' ? 'default' : 
                            event.type === 'appraisal' ? 'secondary' : 'outline'
                          }>
                            {event.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          {event.date.toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
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
      </section>
    </div>
  );
};

export default Home;
