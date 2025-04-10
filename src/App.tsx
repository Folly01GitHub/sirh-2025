
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import AuthGuard from "@/components/auth/AuthGuard";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            
            {/* Protected routes - require authentication */}
            <Route element={<AuthGuard />}>
              <Route path="/home" element={<Home />} />
              {/* Placeholder routes for HRIS pages */}
              <Route path="/dashboard" element={<Home />} />
              <Route path="/leave" element={<Home />} />
              <Route path="/appraisals" element={<Home />} />
              <Route path="/profile" element={<Home />} />
              <Route path="/settings" element={<Home />} />
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
