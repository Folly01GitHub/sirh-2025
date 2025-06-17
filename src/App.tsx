
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
import Dashboard from "./pages/admin/Dashboard";
import AdminLeaves from "./pages/admin/AdminLeaves";
import AdminEvaluations from "./pages/admin/AdminEvaluations";
import Settings from "./pages/admin/Settings";
import UserStats from "./pages/admin/UserStats";
import UserStatsConges from "./pages/admin/UserStatsConges";
import UserStatsEvals from "./pages/admin/UserStatsEvals";
import AdminEvaluationView from "./pages/admin/EvaluationView";
import Activate from "./pages/Activate";
import ForgotPassword from "./pages/ForgotPassword";
import Permissions from "./pages/Permissions";
import Leaves from "./pages/Leaves";
import LeaveRequest from "./pages/LeaveRequest";
import LeaveDetails from "./pages/LeaveDetails";
import Evaluation from "./pages/Evaluation";
import EvaluationDashboard from "./pages/EvaluationDashboard";
import EvaluationView from "./pages/EvaluationView";

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
            <Route path="/activate" element={<Activate />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            
            {/* Protected routes - require authentication */}
            <Route element={<AuthGuard />}>
              <Route path="/home" element={<Home />} />
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/leaves" element={<AdminLeaves />} />
              <Route path="/admin/evaluations" element={<AdminEvaluations />} />
              <Route path="/admin/settings" element={<Settings />} />
              <Route path="/admin/user-stats/:userId" element={<UserStats />} />
              <Route path="/admin/user-stats-conges/:userId" element={<UserStatsConges />} />
              <Route path="/admin/user-stats-evals/:userId" element={<UserStatsEvals />} />
              <Route path="/admin/evaluation-view" element={<AdminEvaluationView />} />
              <Route path="/leave" element={<Leaves />} />
              <Route path="/leave/request" element={<LeaveRequest />} />
              <Route path="/leave-details/:id" element={<LeaveDetails />} />
              <Route path="/permissions" element={<Permissions />} />
              <Route path="/evaluations" element={<EvaluationDashboard />} />
              <Route path="/evaluation" element={<Evaluation />} />
              <Route path="/evaluation-view" element={<EvaluationView />} />
              <Route path="/cashout" element={<Home />} />
              <Route path="/certificates" element={<Home />} />
              <Route path="/dashboard" element={<Home />} />
              <Route path="/assessments" element={<Home />} />
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
