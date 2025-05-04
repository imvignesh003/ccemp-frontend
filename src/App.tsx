
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { useAuth } from "./hooks/useAuth";


import AppLayout from "./components/layout/AppLayout";

// Pages
import Login from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import StudentDashboard from "./pages/student/Dashboard";
import LeaderDashboard from "./pages/leader/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";
// import ClubsPage from "./pages/clubs/index";
// import ClubDetail from "./pages/clubs/ClubDetail";
// import EventsPage from "./pages/events/index";
// import EventDetail from "./pages/events/EventDetail";
// import AnnouncementsPage from "./pages/announcements/index";
// import ProfilePage from "./pages/profile/index";
// import CreateEvent from "./pages/leader/CreateEvent";
// import ManageClubsPage from "./pages/leader/ManageClubs";
// import CreateAnnouncementForm from "./components/announcements/CreateAnnouncementForm";

// // Import new admin pages

// import ManageUsersPage from "./pages/admin/ManageUsers";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};


// Role-based dashboard selector
const DashboardSelector = () => {
  const { profile } = useAuth();
  console.log("At dbSelector : Profile:", profile);
  switch (profile?.user.role) {
    case "STUDENT":
      return <StudentDashboard />;
    case "CLUB_LEADER":
      return <LeaderDashboard />;
    case "ADMIN":
      return <AdminDashboard />;
    default:
      return <Navigate to="/login" />;
  }
};

// // Role-based route access control
// const RoleProtectedRoute = ({ 
//   children, 
//   allowedRoles 
// }: { 
//   children: React.ReactNode,
//   allowedRoles: string[]
// }) => {
//   const { profile } = useAuth();
  
//   if (!profile || !allowedRoles.includes(profile.role)) {
//     return <Navigate to="/" />;
//   }
  
//   return <>{children}</>;
// };

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    
    <Route path="/" element={
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    }>
      <Route index element={<DashboardSelector />} />
      
      {/* Club Routes */}
      {/* <Route path="clubs" element={<ClubsPage />} /> */}
      {/* <Route path="clubs/:id" element={<ClubDetail />} /> */}
      {/* <Route path="manage-clubs" element={
        <RoleProtectedRoute allowedRoles={['CLUB_LEADER', 'ADMIN']}>
          <ManageClubsPage />
        </RoleProtectedRoute>
      } /> */}
      {/* <Route path="manage-clubs/:id" element={
        <RoleProtectedRoute allowedRoles={['CLUB_LEADER', 'ADMIN']}>
          <ManageClubsPage />
        </RoleProtectedRoute>
      } /> */}
      
      {/* Event Routes
      <Route path="events" element={<EventsPage />} />
      <Route path="events/:id" element={<EventDetail />} />
      <Route path="create-event" element={
        <RoleProtectedRoute allowedRoles={['CLUB_LEADER', 'ADMIN']}>
          <CreateEvent />
        </RoleProtectedRoute>
      } />
      <Route path="manage-events" element={
        <RoleProtectedRoute allowedRoles={['CLUB_LEADER', 'ADMIN']}>
          <ManageClubsPage />
        </RoleProtectedRoute>
      } /> */}
      
      {/* Announcement Routes
      <Route path="announcements" element={<AnnouncementsPage />} />
      <Route path="create-announcement" element={
        <RoleProtectedRoute allowedRoles={['CLUB_LEADER', 'ADMIN']}>
          <CreateAnnouncementForm />
        </RoleProtectedRoute>
      } /> */}
      
      {/* Profile Routes
      <Route path="profile" element={<ProfilePage />} /> */}
      
      {/* Admin Routes
      <Route path="admin/users" element={
        <RoleProtectedRoute allowedRoles={['ADMIN']}>
          <ManageUsersPage />
        </RoleProtectedRoute>
      } /> */}
    </Route>
    
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
