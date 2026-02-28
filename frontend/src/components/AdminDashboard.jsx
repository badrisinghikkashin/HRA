import { useEffect, useState, useCallback } from "react";
import { Users, LogIn, Coffee } from "lucide-react";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "../context/AuthContext";
import { getEmployees } from "../lib/api/employeeApi";
import { getAttendance } from "../lib/api/attendanceApi";
// import DebugDataViewer from "./DebugDataViewer";

const today = new Date().toLocaleDateString("en-CA", {
  timeZone: "Asia/Kolkata",
});

const AdminDashboard = () => {
  const socket = useSocket();
  const { logout } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH DATA ================= */

  const fetchData = useCallback(async () => {
    try {
      const empRes = await getEmployees();
      const attRes = await getAttendance();

      console.log("=== ADMIN DASHBOARD DATA ===");
      console.log("EMPLOYEES TOTAL:", empRes.data?.employees?.length || 0);
      console.log("ALL ATTENDANCE RECORDS:", attRes.data?.length || 0);
      console.log("ATTENDANCE DATA:", attRes.data);
      
      // Log today's attendance specifically - using checkInTime for date matching
      const todayStr = new Date().toISOString().split("T")[0];
      const todayRecords = attRes.data?.filter((a) => {
        if (!a?.checkInTime) return false;
        const checkInDate = typeof a.checkInTime === 'string' 
          ? a.checkInTime.split("T")[0]  
          : new Date(a.checkInTime).toISOString().split("T")[0];
        return checkInDate === todayStr;
      }) || [];
      console.log(`TODAY'S ATTENDANCE (${todayStr}):`, todayRecords);
      console.log("Checked in today:", todayRecords.filter((a) => a.checkInTime).length);

      setEmployees(empRes.data?.employees || []);
      setAttendance(attRes.data || []);
    } catch (err) {
      console.error("❌ Dashboard fetch error:", err);
      if (err.response && err.response.status === 401) {
        // token expired or unauthorized, force logout
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, [logout]);

  /* ================= INITIAL FETCH ================= */

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ================= SOCKET REALTIME UPDATE ================= */

  useEffect(() => {
    if (!socket) {
      console.warn("⚠️ Socket not available");
      return;
    }

    // Fetch data whenever socket connects
    const handleConnect = () => {
      console.log("✅ Admin socket connected! Fetching fresh data...");
      fetchData();
    };

    // Fetch data whenever anyone updates attendance
    const handleUpdate = (data) => {
      console.log("📊 Real-time attendance update received:", data);
      fetchData();
    };

    // Subscribe to events
    socket.on("connect", handleConnect);
    socket.on("attendance-update", handleUpdate);
    socket.on("break-update", handleUpdate);

    // Cleanup
    return () => {
      socket.off("connect", handleConnect);
      socket.off("attendance-update", handleUpdate);
      socket.off("break-update", handleUpdate);
    };
  }, [socket, fetchData]);

  /* ================= CALCULATIONS ================= */

  const totalEmployees = employees.length;
  console.log("🔍 ADMIN CALCULATION - Total Employees:", totalEmployees);

  // Debug: Check date format and filter
  console.log("📅 Today string:", today);
  console.log("📦 Raw attendance data length:", attendance.length);
  if (attendance.length > 0) {
    console.log("  First record:", attendance[0]);
  }
  
  // Multiple date matching strategies since dates might be in different formats
  const todayAttendance = attendance.filter((a) => {
     if (!a?.checkInTime) return false;

  const checkInDate = new Date(a.checkInTime).toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
    const match = checkInDate === today;
    if (!match && attendance.indexOf(a) < 3) {
      console.log(`  Date check: ${checkInDate} === ${today} ? ${match}`);
    }
    return match;
  });

  console.log("🔍 Today's attendance count:", todayAttendance.length);
  console.log("📋 Today's attendance records:", todayAttendance);

  // number of employees who are currently checked in (not yet checked out)
  const currentlyCheckedIn = todayAttendance.filter(
  (a) => a.checkInTime && !a.checkOutTime
).length;
  console.log("✅ Currently checked-in today:", currentlyCheckedIn);

  const onBreak = todayAttendance.filter((a) =>
    a.breaks?.some((b) => b.endTime === null)
  ).length;
  console.log("☕ On break count:", onBreak);

  /* ================= STATS ================= */

  const stats = [
    {
      label: "Total Employees",
      value: totalEmployees,
      icon: Users,
      color: "from-blue-500 to-indigo-500",
    },
    {
      label: "Currently Checked-In",
      value: currentlyCheckedIn,
      icon: LogIn,
      color: "from-emerald-500 to-green-500",
    },
    {
      label: "On Break",
      value: onBreak,
      icon: Coffee,
      color: "from-amber-400 to-orange-500",
    },
  ];

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="p-6 text-slate-500">
        Loading dashboard...
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Admin Dashboard 👋
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Overview of today's attendance
          </p>
        </div>

        {/* Refresh Button */}
        <button
          onClick={fetchData}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all active:scale-95"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {stats.map((s) => (
          <div
            key={s.label}
            className="relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${s.color} text-white shadow-md`}
            >
              <s.icon size={22} />
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              {Number.isNaN(s.value) ? 0 : s.value}
            </h2>

            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
              {s.label}
            </p>

            <div
              className={`absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br ${s.color} opacity-10 rounded-full blur-2xl`}
            />
          </div>
        ))}
      </div>

      {/* Debug Viewer */}
      {/* <DebugDataViewer /> */}
    </div>
  );
};

export default AdminDashboard;