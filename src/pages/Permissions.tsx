
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
import PermissionRequestForm from '@/components/permissions/PermissionRequestForm';
import PermissionRequests from '@/components/permissions/PermissionRequests';
import PermissionValidations from '@/components/permissions/PermissionValidations';
import { FormInput, PanelBottom, ClipboardCheck } from 'lucide-react';

const Permissions = () => {
  const [activeSection, setActiveSection] = useState("form");

  // Menu items for sidebar
  const menuItems = [
    { id: "form", label: "Formulaire de demande", icon: FormInput, shortLabel: "Demande" },
    { id: "requests", label: "Mes demandes", icon: PanelBottom, shortLabel: "Demandes" },
    { id: "validations", label: "Demandes à valider", icon: ClipboardCheck, shortLabel: "Validations" }
  ];

  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen w-full bg-[#f8f9fc]">
        <HRISNavbar />
        
        <div className="flex flex-1 h-full overflow-hidden">
          {/* Sidebar using the same structure as AdminLayout */}
          <Sidebar>
            <SidebarHeader className="p-4">
              <h3 className="text-lg font-medium">Espace Permissions</h3>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton 
                      isActive={activeSection === item.id}
                      onClick={() => setActiveSection(item.id)}
                      tooltip={item.label}
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

          {/* Main content area using SidebarInset for consistent layout with admin */}
          <SidebarInset className="flex flex-col h-full overflow-auto">
            <div className="container mx-auto p-4 md:p-6 lg:p-8 animate-fade-in">
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-[#172b4d] mb-4 animate-fade-in">
                  Espace Permissions
                </h1>
                <p className="text-lg text-[#5e6c84] max-w-2xl mx-auto animate-fade-in">
                  Gérez vos demandes de permission pour des absences temporaires
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                {activeSection === "form" && (
                  <>
                    <h2 className="text-2xl font-semibold text-[#172b4d] mb-4">
                      Formulaire de demande
                    </h2>
                    <PermissionRequestForm />
                  </>
                )}
                
                {activeSection === "requests" && (
                  <>
                    <h2 className="text-2xl font-semibold text-[#172b4d] mb-4">
                      Mes demandes
                    </h2>
                    <PermissionRequests />
                  </>
                )}
                
                {activeSection === "validations" && (
                  <>
                    <h2 className="text-2xl font-semibold text-[#172b4d] mb-4">
                      Demandes à valider
                    </h2>
                    <PermissionValidations />
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

export default Permissions;
