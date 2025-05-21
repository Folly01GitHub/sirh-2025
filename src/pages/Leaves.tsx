
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import HRISNavbar from '@/components/hris/HRISNavbar';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset
} from '@/components/ui/sidebar';
import LeaveStats from '@/components/leaves/LeaveStats';
import LeaveRequestForm from '@/components/leaves/LeaveRequestForm';
import LeaveRequests from '@/components/leaves/LeaveRequests';
import LeaveValidations from '@/components/leaves/LeaveValidations';
import { CalendarDays, PanelBottom, ClipboardCheck } from 'lucide-react';

const Leaves = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("dashboard");

  // Determine if the user is a manager to show the validations section
  const isManager = user?.role === 'admin' || user?.isManager;

  const handleSectionChange = (section: string) => {
    console.log(`Changing active section to: ${section}`);
    setActiveSection(section);
  };

  const menuItems = [
    { id: "dashboard", label: "Tableau de bord", icon: CalendarDays, shortLabel: "Dashboard" },
    { id: "requests", label: "Mes demandes", icon: PanelBottom, shortLabel: "Demandes" },
    // Only show validation section to managers
    ...(isManager ? [{ id: "validations", label: "Demandes à valider", icon: ClipboardCheck, shortLabel: "Validations" }] : [])
  ];

  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen w-full bg-[#f8f9fc]">
        <HRISNavbar />
        
        <div className="flex flex-1 h-full overflow-hidden">
          <Sidebar>
            <SidebarHeader className="p-4 pb-0">
              <h3 className="text-lg font-medium mb-4">Gestion des Congés</h3>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton 
                      isActive={activeSection === item.id}
                      onClick={() => handleSectionChange(item.id)}
                      tooltip={item.label}
                      className={`
                        ${activeSection === item.id 
                          ? 'bg-primary/10 text-primary font-semibold border-l-4 border-primary' 
                          : 'hover:bg-gray-100'}
                        transition-all duration-200 ease-in-out
                      `}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="hidden md:inline">{item.label}</span>
                      <span className="md:hidden">{item.shortLabel}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>

          <SidebarInset className="flex flex-col h-full overflow-auto">
            <div className="container mx-auto p-4 md:p-6 lg:p-8 animate-fade-in">
              <div className="text-center mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-[#172b4d] mb-2 animate-fade-in">
                  Gestion des Congés
                </h1>
                <p className="text-lg text-[#5e6c84] max-w-2xl mx-auto animate-fade-in">
                  Suivez vos congés, soumettez des demandes et gérez les approbations
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                {activeSection === "dashboard" && (
                  <>
                    <LeaveStats />
                    <div className="mt-8">
                      <h2 className="text-2xl font-semibold text-[#172b4d] mb-4">
                        Nouvelle demande de congé
                      </h2>
                      <LeaveRequestForm />
                    </div>
                  </>
                )}
                
                {activeSection === "requests" && (
                  <>
                    <h2 className="text-2xl font-semibold text-[#172b4d] mb-4">
                      Mes demandes de congés
                    </h2>
                    <LeaveRequests />
                  </>
                )}
                
                {activeSection === "validations" && isManager && (
                  <>
                    <h2 className="text-2xl font-semibold text-[#172b4d] mb-4">
                      Demandes à valider
                    </h2>
                    <LeaveValidations />
                  </>
                )}
              </div>
            </div>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Leaves;
