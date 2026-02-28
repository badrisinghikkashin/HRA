import "@/index.css";
import "@/App.css";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext"; // ⭐ ADDED
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";

import Login from "./components/HraLogin";
import AdminDashboard from "./components/AdminDashboard";
import EmployeeRegistration from "./components/EmployeeRegistration";
import AttendanceMonitoring from "./components/AttendanceMonitoring";
import MeetingAttendance from "./components/MeetingAttendance";
import EmployeeDashboard from "./components/EmployeeDashboard";
import MyAttendance from "./components/MyAttendance";
import MissedMeetings from "./components/MissedMeetings";

const queryClient = new QueryClient();

const AdminPage = ({ children }) => (
  <ProtectedRoute allowedRole="admin">
    <DashboardLayout>{children}</DashboardLayout>
  </ProtectedRoute>
);

const EmployeePage = ({ children }) => (
  <ProtectedRoute allowedRole="employee">
    <DashboardLayout>{children}</DashboardLayout>
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      {/* ⭐ Socket Provider Added (Nothing Removed) */}
      <SocketProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <AdminPage>
                    <AdminDashboard />
                  </AdminPage>
                }
              />
              <Route
                path="/admin/employees"
                element={
                  <AdminPage>
                    <EmployeeRegistration />
                  </AdminPage>
                }
              />
              <Route
                path="/admin/attendance"
                element={
                  <AdminPage>
                    <AttendanceMonitoring />
                  </AdminPage>
                }
              />
              <Route
                path="/admin/meetings"
                element={
                  <AdminPage>
                    <MeetingAttendance />
                  </AdminPage>
                }
              />

              {/* Employee Routes */}
              <Route
                path="/employee"
                element={
                  <EmployeePage>
                    <EmployeeDashboard />
                  </EmployeePage>
                }
              />
              <Route
                path="/employee/attendance"
                element={
                  <EmployeePage>
                    <MyAttendance />
                  </EmployeePage>
                }
              />
              <Route
                path="/employee/meetings"
                element={
                  <EmployeePage>
                    <MissedMeetings />
                  </EmployeePage>
                }
              />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </SocketProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;