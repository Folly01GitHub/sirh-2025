
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarInset,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  User,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleReturnToHome = () => {
    navigate('/home');
  };

  const menuItems = [
    { path: '/admin/dashboard', label: 'Tableau de Bord', icon: LayoutDashboard },
    { path: '/admin/settings', label: 'Paramètres', icon: Settings }
  ];

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-white to-gray-50">
        <Sidebar>
          <SidebarHeader className="p-4">
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <div className="bg-primary rounded-md p-1">
                <User className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-lg">Portail Admin</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      asChild 
                      tooltip="Retour à l'accueil"
                    >
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-2 mb-2 border-[#171c8f]/20 hover:bg-[#171c8f]/5 hover:border-[#171c8f]/50 text-[#171c8f]" 
                        onClick={handleReturnToHome}
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Retour à l'accueil</span>
                      </Button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={isActive(item.path)}
                        tooltip={item.label}
                      >
                        <Link to={item.path}>
                          <item.icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2" 
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span>Déconnexion</span>
            </Button>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col h-full overflow-auto">
          {/* Header */}
          <header className="bg-white border-b flex justify-between items-center p-4 sticky top-0 z-10">
            <div className="flex items-center">
              <SidebarTrigger className="mr-2" />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
                <span className="font-medium hidden md:block">{user?.email}</span>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
