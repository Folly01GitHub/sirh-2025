
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
import { Menu, X, Home, LayoutDashboard, CalendarDays, Award, LogOut, User, Settings } from 'lucide-react';

const HRISNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="relative h-8 w-8 mr-2">
                <div className="absolute inset-0 rounded-md bg-primary"></div>
                <div className="absolute inset-0.5 rounded-md bg-white flex items-center justify-center text-primary font-bold">
                  RH
                </div>
              </div>
              <span className="text-lg font-bold text-gray-900">Portail RH</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-6">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                    <Link to="/">
                      <Home className="h-4 w-4 mr-1" />
                      <span>Accueil</span>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                    <Link to="/dashboard">
                      <LayoutDashboard className="h-4 w-4 mr-1" />
                      <span>Tableau de Bord</span>
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
                    <Link to="/appraisals">
                      <Award className="h-4 w-4 mr-1" />
                      <span>Évaluations</span>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {/* Profile Menu */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://github.com/shadcn.png" alt="Avatar utilisateur" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56" align="end">
                <div className="grid gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src="https://github.com/shadcn.png" alt="Avatar utilisateur" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                      <p className="text-sm font-medium">John Doe</p>
                      <p className="text-xs text-gray-500">john@example.com</p>
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
                    <Button variant="ghost" size="sm" className="justify-start text-red-500 hover:text-red-500 hover:bg-red-50" asChild>
                      <Link to="/">
                        <LogOut className="h-4 w-4 mr-2" />
                        <span>Déconnexion</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Mobile Menu Button */}
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

      {/* Mobile Menu */}
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
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">John Doe</p>
                  <p className="text-sm text-gray-500">john@example.com</p>
                </div>
              </div>
              <nav className="flex flex-col space-y-1">
                <Link
                  to="/"
                  className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100"
                  onClick={toggleMobileMenu}
                >
                  <Home className="h-5 w-5 mr-3" />
                  <span>Accueil</span>
                </Link>
                <Link
                  to="/dashboard"
                  className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100"
                  onClick={toggleMobileMenu}
                >
                  <LayoutDashboard className="h-5 w-5 mr-3" />
                  <span>Tableau de Bord</span>
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
                  to="/appraisals"
                  className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100"
                  onClick={toggleMobileMenu}
                >
                  <Award className="h-5 w-5 mr-3" />
                  <span>Évaluations</span>
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
                <Link
                  to="/"
                  className="flex items-center px-3 py-2 text-red-500 rounded-md hover:bg-red-50"
                  onClick={toggleMobileMenu}
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  <span>Déconnexion</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default HRISNavbar;
