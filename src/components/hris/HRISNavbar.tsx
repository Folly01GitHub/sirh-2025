import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger, 
  navigationMenuTriggerStyle
} from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from '@/components/ui/popover';
import { Menu, X, Home, LayoutDashboard, CalendarDays, Award, LogOut, User, Settings, Lock, Wallet, FileCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const HRISNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    toggleMobileMenu(); // Close mobile menu if open
  };

  const userEmail = user?.email || 'user@example.com';
  const userName = user?.name || userEmail.split('@')[0];
  const avatarFallback = userName.substring(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/home" className="flex items-center">
              <div className="relative h-8 w-8 mr-2">
                <div className="absolute inset-0 rounded-md bg-primary"></div>
                <div className="absolute inset-0.5 rounded-md bg-white flex items-center justify-center text-primary font-bold">
                  RH
                </div>
              </div>
              <span className="text-lg font-bold text-gray-900">Portail RH</span>
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:gap-6">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                    <Link to="/home">
                      <Home className="h-4 w-4 mr-1" />
                      <span>Accueil</span>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                    <Link to="/leave">
                      <CalendarDays className="h-4 w-4 mr-1" />
                      <span>Congés</span>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                    <Link to="/assessments">
                      <Award className="h-4 w-4 mr-1" />
                      <span>Évaluations</span>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                    <Link to="/permissions">
                      <Lock className="h-4 w-4 mr-1" />
                      <span>Permissions</span>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                    <Link to="/cashout">
                      <Wallet className="h-4 w-4 mr-1" />
                      <span>Décaissement</span>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                    <Link to="/certificates">
                      <FileCheck className="h-4 w-4 mr-1" />
                      <span>Certificats</span>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://github.com/shadcn.png" alt="Avatar utilisateur" />
                    <AvatarFallback>{avatarFallback}</AvatarFallback>
                  </Avatar>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56" align="end">
                <div className="grid gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src="https://github.com/shadcn.png" alt="Avatar utilisateur" />
                      <AvatarFallback>{avatarFallback}</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                      <p className="text-sm font-medium">{userName}</p>
                      <p className="text-xs text-gray-500">{userEmail}</p>
                    </div>
                  </div>
                  <div className="grid gap-1">
                    <Button variant="ghost" size="sm" className="justify-start" asChild>
                      <Link to="/profile">
                        <User className="h-4 w-4 mr-2" />
                        <span>Profil</span>
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" className="justify-start" asChild>
                      <Link to="/settings">
                        <Settings className="h-4 w-4 mr-2" />
                        <span>Paramètres</span>
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="justify-start text-red-500 hover:text-red-500 hover:bg-red-50"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      <span>Déconnexion</span>
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={toggleMobileMenu}></div>
          <div className="fixed right-0 top-0 z-50 h-screen w-3/4 bg-white p-4 shadow-lg">
            <div className="flex justify-end mb-6">
              <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            <div className="flex flex-col space-y-6">
              <div className="flex items-center gap-4 mb-4">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" alt="Avatar utilisateur" />
                  <AvatarFallback>{avatarFallback}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{userName}</p>
                  <p className="text-sm text-gray-500">{userEmail}</p>
                </div>
              </div>
              <nav className="flex flex-col space-y-1">
                <Link
                  to="/home"
                  className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100"
                  onClick={toggleMobileMenu}
                >
                  <Home className="h-5 w-5 mr-3" />
                  <span>Accueil</span>
                </Link>
                <Link
                  to="/leave"
                  className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100"
                  onClick={toggleMobileMenu}
                >
                  <CalendarDays className="h-5 w-5 mr-3" />
                  <span>Congés</span>
                </Link>
                <Link
                  to="/assessments"
                  className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100"
                  onClick={toggleMobileMenu}
                >
                  <Award className="h-5 w-5 mr-3" />
                  <span>Évaluations</span>
                </Link>
                <Link
                  to="/permissions"
                  className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100"
                  onClick={toggleMobileMenu}
                >
                  <Lock className="h-5 w-5 mr-3" />
                  <span>Permissions</span>
                </Link>
                <Link
                  to="/cashout"
                  className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100"
                  onClick={toggleMobileMenu}
                >
                  <Wallet className="h-5 w-5 mr-3" />
                  <span>Décaissement</span>
                </Link>
                <Link
                  to="/certificates"
                  className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100"
                  onClick={toggleMobileMenu}
                >
                  <FileCheck className="h-5 w-5 mr-3" />
                  <span>Certificats</span>
                </Link>
              </nav>
              <div className="border-t border-gray-200 pt-4 mt-4">
                <Link
                  to="/profile"
                  className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100"
                  onClick={toggleMobileMenu}
                >
                  <User className="h-5 w-5 mr-3" />
                  <span>Profil</span>
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100"
                  onClick={toggleMobileMenu}
                >
                  <Settings className="h-5 w-5 mr-3" />
                  <span>Paramètres</span>
                </Link>
                <button
                  className="flex items-center w-full text-left px-3 py-2 text-red-500 rounded-md hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default HRISNavbar;
