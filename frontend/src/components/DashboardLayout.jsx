import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  CalendarX,
  Clock,
  AlertCircle,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

const adminNavItems = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Employees", path: "/admin/employees", icon: Users },
  { label: "Attendance", path: "/admin/attendance", icon: ClipboardCheck },
  { label: "Meetings", path: "/admin/meetings", icon: CalendarX },
];

const employeeNavItems = [
  { label: "Dashboard", path: "/employee", icon: LayoutDashboard },
  { label: "My Attendance", path: "/employee/attendance", icon: Clock },
  { label: "Missed Meetings", path: "/employee/meetings", icon: AlertCircle },
];

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = user?.role === "admin" ? adminNavItems : employeeNavItems;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950">

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[260px] flex flex-col
        bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl
        border-r border-slate-200 dark:border-slate-700
        shadow-xl transition-transform duration-300
        lg:translate-x-0 lg:static
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
              <ClipboardCheck className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-800 dark:text-white">
              HRA System
            </span>
          </div>

          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* User Card */}
        <div className="mx-4 mt-5 p-4 rounded-xl bg-slate-100 dark:bg-slate-800 shadow-inner">
          <p className="text-xs uppercase text-slate-500">{user?.role}</p>
          <p className="font-semibold text-slate-800 dark:text-white truncate">
            {user?.name}
          </p>
          <p className="text-xs text-slate-500 truncate">{user?.id}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 mt-5 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`
                flex items-center gap-3 px-4 py-2.5 rounded-lg
                text-sm font-medium transition-all
                ${
                  isActive(item.path)
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                }
              `}
            >
              <item.icon className="w-[18px] h-[18px]" />
              <span>{item.label}</span>
              {isActive(item.path) && (
                <ChevronRight className="w-4 h-4 ml-auto opacity-70" />
              )}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg w-full
            text-red-500 hover:bg-red-500/10 transition"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Section */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Bar */}
        <header className="h-16 flex items-center px-4 lg:px-6
          bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl
          border-b border-slate-200 dark:border-slate-700
          shadow-sm sticky top-0 z-30">

          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden mr-2"
          >
            <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Clock className="w-4 h-4" />
            <span>
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;