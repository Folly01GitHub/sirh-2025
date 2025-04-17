
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import HRISNavbar from '@/components/hris/HRISNavbar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import PermissionRequestForm from '@/components/permissions/PermissionRequestForm';
import PermissionRequests from '@/components/permissions/PermissionRequests';
import PermissionValidations from '@/components/permissions/PermissionValidations';
import { FormInput, PanelBottom, ClipboardCheck } from 'lucide-react';

const Permissions = () => {
  const [activeTab, setActiveTab] = useState("form");

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fc]">
      <HRISNavbar />
      
      <section className="relative flex-1 px-4 py-6 md:px-6 md:py-12 lg:px-8 lg:py-16">
        <div className="container mx-auto h-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[#172b4d] mb-4 animate-fade-in">
              Espace Permissions
            </h1>
            <p className="text-lg text-[#5e6c84] max-w-2xl mx-auto animate-fade-in">
              Gérez vos demandes de permission pour des absences temporaires
            </p>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-6 h-full">
            {/* Sidebar with tabs - fixed width and position */}
            <div className="w-full lg:w-[280px] flex-shrink-0 bg-white rounded-lg shadow-md p-4 animate-fade-in">
              <Tabs 
                defaultValue="form" 
                value={activeTab} 
                onValueChange={setActiveTab}
                orientation="vertical" 
                className="w-full h-full"
              >
                <TabsList className="w-full flex flex-row lg:flex-col gap-2 border-0 bg-transparent">
                  <TabsTrigger 
                    value="form"
                    className="w-full flex justify-start gap-3 p-3 data-[state=active]:bg-[#2563EB]/10 data-[state=active]:text-[#2563EB] rounded-lg transition-all"
                  >
                    <FormInput className="h-5 w-5 flex-shrink-0" />
                    <span className="hidden md:inline whitespace-nowrap">Formulaire de demande</span>
                    <span className="md:hidden">Demande</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="requests"
                    className="w-full flex justify-start gap-3 p-3 data-[state=active]:bg-[#2563EB]/10 data-[state=active]:text-[#2563EB] rounded-lg transition-all"
                  >
                    <PanelBottom className="h-5 w-5 flex-shrink-0" />
                    <span className="hidden md:inline whitespace-nowrap">Mes demandes</span>
                    <span className="md:hidden">Demandes</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="validations"
                    className="w-full flex justify-start gap-3 p-3 data-[state=active]:bg-[#2563EB]/10 data-[state=active]:text-[#2563EB] rounded-lg transition-all"
                  >
                    <ClipboardCheck className="h-5 w-5 flex-shrink-0" />
                    <span className="hidden md:inline whitespace-nowrap">Demandes à valider</span>
                    <span className="md:hidden">Validations</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {/* Main content area - flexible width */}
            <div className="w-full lg:flex-1 animate-fade-in overflow-hidden">
              {activeTab === "form" && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-semibold text-[#172b4d] mb-4">
                    Formulaire de demande
                  </h2>
                  <PermissionRequestForm />
                </div>
              )}
              
              {activeTab === "requests" && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-semibold text-[#172b4d] mb-4">
                    Mes demandes
                  </h2>
                  <PermissionRequests />
                </div>
              )}
              
              {activeTab === "validations" && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-semibold text-[#172b4d] mb-4">
                    Demandes à valider
                  </h2>
                  <PermissionValidations />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Permissions;
