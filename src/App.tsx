import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import Login from "@/pages/Login";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Projects from "@/pages/Projects";
import ProjectDetails from "@/pages/ProjectDetails";
import Workers from "@/pages/Workers";
import Materials from "@/pages/Materials";
import Budget from "@/pages/Budget";
import WorkerDashboard from "@/pages/WorkerDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/worker-dashboard" replace />;
  return <AppLayout>{children}</AppLayout>;
};

const WorkerRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isWorker } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isWorker) return <Navigate to="/dashboard" replace />;
  return <AppLayout>{children}</AppLayout>;
};

const AppRoutes = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const defaultRoute = !isAuthenticated ? "/landing" : isAdmin ? "/dashboard" : "/worker-dashboard";

  return (
    <Routes>
      <Route path="/landing" element={isAuthenticated ? <Navigate to={defaultRoute} replace /> : <Landing />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to={defaultRoute} replace /> : <Login />} />
      <Route path="/" element={<Navigate to={defaultRoute} replace />} />

      {/* Admin routes */}
      <Route path="/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
      <Route path="/projects" element={<AdminRoute><Projects /></AdminRoute>} />
      <Route path="/projects/:id" element={<AdminRoute><ProjectDetails /></AdminRoute>} />
      <Route path="/workers" element={<AdminRoute><Workers /></AdminRoute>} />
      <Route path="/materials" element={<AdminRoute><Materials /></AdminRoute>} />
      <Route path="/budget" element={<AdminRoute><Budget /></AdminRoute>} />

      {/* Worker routes */}
      <Route path="/worker-dashboard" element={<WorkerRoute><WorkerDashboard /></WorkerRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
