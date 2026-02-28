import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import {
  getMyAttendance,
  checkIn,
  checkOut,
  breakStart,
  breakEnd,
} from "@/lib/api/attendanceApi";

import {
  LogIn,
  LogOut,
  Coffee,
  UtensilsCrossed,
  StopCircle,
  Clock,
  Timer,
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";

const formatIST = (time) => {
  if (!time) return "—";

  return new Date(time).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const { toast } = useToast();

  const [status, setStatus] = useState("not-checked-in");
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [breakLogs, setBreakLogs] = useState([]);
  const [workingHours, setWorkingHours] = useState(null);
 
  /* ================= LOAD ATTENDANCE ================= */
const fetchMyAttendance = async () => {
      try {
        const res = await getMyAttendance();

        console.log("📍 MY ATTENDANCE API RESPONSE:", res.data);

        if (!res.data?.length) {
          console.log("❌ No attendance records found");
          setStatus("not-checked-in");
          return;
        }

        // Find TODAY'S record by matching checkInTime date, not the date field
        const todayDate = new Date().toISOString().split("T")[0];
        const todayRecord = res.data.find((r) => {
          if (!r.checkInTime) return false;
          const recordDate = typeof r.checkInTime === 'string'
            ? r.checkInTime.split("T")[0]
            : new Date(r.checkInTime).toISOString().split("T")[0];
          return recordDate === todayDate;
        });

        console.log(`🔍 Looking for today (${todayDate})`);
        console.log("📋 Found today's record:", todayRecord);

        if (!todayRecord) {
          console.log("⏱️ No record for today yet, showing not-checked-in");
          setStatus("not-checked-in");
          return;
        }

        setCheckInTime(formatIST(todayRecord.checkInTime));
        setCheckOutTime(formatIST(todayRecord.checkOutTime));
        setBreakLogs(todayRecord.breaks || []);

        /* ===== FIXED STATUS ===== */

        if (!todayRecord.checkInTime) {
          setStatus("not-checked-in");
        } else if (todayRecord.checkOutTime) {
          setStatus("checked-out");
        } else if (todayRecord.breaks?.some((b) => !b.endTime)) {
          setStatus("tea-break");
        } else {
          setStatus("working");
        }
      } catch (err) {
        console.error("❌ My attendance fetch error:", err);
      }
    };

  useEffect(() => {
  if (user) fetchMyAttendance();
}, [user]);


  /* ================= SOCKET LISTENER ================= */

  useEffect(() => {
  if (!socket) return;

  socket.on("attendance-update", fetchMyAttendance);
  console.log("attendance-update")

  return () => socket.off("attendance-update");
}, [socket]);

  /* ================= ACTION HANDLERS ================= */

//   const handleCheckIn = async () => {
//     try {
//       // 🔥 Immediately hide button
//       setStatus("working");

//       const res = await checkIn();

//       console.log("res is here in check in button==>>>",res)

//       setCheckInTime(formatIST(res.data.checkInTime));

//       toast({
//         title: "✅ Checked In Successfully",
//         description: `You checked in at ${formatIST(res.data.checkInTime)}`,
//       });
//     } catch (err) {
//       // Agar API fail ho jaye to status revert karo
//       setStatus("not-checked-in");

//       const errMsg = err.response?.data?.message || "Check-in failed";
//       toast({
//         title: "❌ Check-in Failed",
//         description: errMsg,
//         variant: "destructive",
//       });
//     }
//   };

const handleCheckIn = async () => {
  try {
    setStatus("working");

    const res = await checkIn();

    setCheckInTime(formatIST(res.data.checkInTime));

    // Add logging to debug socket emit
    if (socket) {
      console.log("📤 Emitting check-in event to admins...");
      socket.emit("attendance-update", {
        type: "check-in",
        userId: user.id,
        timestamp: new Date().toISOString(),
      });
    } else {
      console.warn("⚠️ Socket not connected, admins won't get real-time update");
    }

    toast({
      title: "✅ Checked In Successfully",
      description: `You checked in at ${formatIST(res.data.checkInTime)}`,
    });
  } catch (err) {
    setStatus("not-checked-in");
    const errMsg = err.response?.data?.message || "Check-in failed";
    toast({
      title: "❌ Check-In Failed",
      description: errMsg,
      variant: "destructive",
    });
  }
};

  const handleCheckOut = async () => {
    try {
      const res = await checkOut();

      setCheckOutTime(formatIST(res.data.checkOutTime));
      setWorkingHours(res.data.workingHours); // ⭐ IMPORTANT

      setStatus("checked-out");

      socket.emit("attendance-update", {
        type: "check-out",
        userId: user.id,
      });

      toast({
        title: "Checked Out Successfully",
        description: `Work hours: ${res.data.workingHours}`,
      });
    } catch (err) {
      const errMsg = err.response?.data?.message || "Check-out failed";
      toast({
        title: "Error",
        description: errMsg,
        variant: "destructive",
      });
    }
  };

  const handleBreakStart = async (type) => {
    try {
      // send object so server destructuring works; helper handles casing
      const res = await breakStart({ breakType: type.toUpperCase() });

    setBreakLogs((prev) => [
      ...prev,
      { type, start: formatIST(res.data.startTime), end: null },
    ]);

    setStatus(type.toUpperCase() === "TEA" ? "tea-break" : "lunch-break");

    socket.emit("attendance-update", {
      type: "break-start",
      userId: user.id,
    });

    toast({
      title: `☕ ${type} Break Started`,
      description: `Started at ${res.data.startTime}. Allowed duration: ${res.data.allowedDurationMinutes} minutes`,
    });
  } catch (err) {
    const errMsg = err.response?.data?.message || "Break start failed";
    toast({
      title: "❌ Cannot Start Break",
      description: errMsg,
      variant: "destructive",
    });
  }
};

  const handleBreakEnd = async () => {
    try {
      const res = await breakEnd();

      setBreakLogs((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last) last.end = formatIST(res.data.endTime);
        return updated;
      });

      setStatus("working");

      socket.emit("attendance-update", {
        type: "break-end",
        userId: user.id,
      });

      toast({
        title: "✅ Break Ended",
        description: `Ended at ${res.data.endTime}`,
      });
    } catch (err) {
      const errMsg = err.response?.data?.message || "Break end failed";
      toast({
        title: "❌ Break End Failed",
        description: errMsg,
        variant: "destructive",
      });
    }
  };

  const isOnBreak = status === "tea-break" || status === "lunch-break";

  const statusConfig = {
    "not-checked-in": {
      label: "Not Checked In",
      color: "bg-slate-100 text-slate-700",
    },
    working: {
      label: "Working",
      color: "bg-emerald-100 text-emerald-700",
    },
    "tea-break": {
      label: "Tea Break",
      color: "bg-yellow-100 text-yellow-700",
    },
    "lunch-break": {
      label: "Lunch Break",
      color: "bg-yellow-100 text-yellow-700",
    },
    "checked-out": {
      label: "Day Complete",
      color: "bg-blue-100 text-blue-700",
    },
  };

  const sc = statusConfig[status];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
        <p className="text-sm text-slate-500">
          Manage your attendance & breaks today
        </p>
      </div>

      {/* Status */}
      <div className="flex items-center gap-5 p-5 rounded-2xl bg-white shadow-lg border">
        <div
          className={`w-12 h-12 flex items-center justify-center rounded-xl ${sc.color}`}
        >
          <Clock className="w-6 h-6" />
        </div>

        <div className="flex-1">
          <p className="text-xs text-slate-500">Current Status</p>
          <p className="text-lg font-semibold">{sc.label}</p>
        </div>

        <span
          className={`px-4 py-1 rounded-full text-xs font-semibold ${sc.color}`}
        >
          {sc.label}
        </span>
      </div>

      {/* TIME CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card
          icon={LogIn}
          label="Check-In"
          value={checkInTime || "—"}
          color="emerald"
        />
        <Card
          icon={LogOut}
          label="Check-Out"
          value={checkOutTime || "—"}
          color="red"
        />
        <Card
          icon={Coffee}
          label="Breaks Taken"
          value={breakLogs.length}
          color="yellow"
        />
        <Card
          icon={Timer}
          label="Work Hours"
          value={
            workingHours
              ? workingHours
              : checkInTime && !checkOutTime
                ? "In progress"
                : "—"
          }
          color="blue"
        />
      </div>

      {/* ACTION BUTTONS */}
      <div className="p-8 rounded-2xl bg-white shadow-lg border">
        <h3 className="text-xl font-bold mb-6">Attendance Actions</h3>

        <div className="flex flex-wrap gap-4">
          {status === "not-checked-in" && (
            <ActionButton onClick={handleCheckIn} icon={LogIn} color="green">
              Check In
            </ActionButton>
          )}

          {status === "working" && (
            <>
              <ActionButton
                onClick={() => handleBreakStart("tea")}
                icon={Coffee}
                color="yellow"
              >
                Tea Break
              </ActionButton>

              <ActionButton
                onClick={() => handleBreakStart("lunch")}
                icon={UtensilsCrossed}
                color="yellow"
              >
                Lunch Break
              </ActionButton>

              <ActionButton onClick={handleCheckOut} icon={LogOut} color="red">
                Check Out
              </ActionButton>
            </>
          )}

          {isOnBreak && (
            <ActionButton
              onClick={handleBreakEnd}
              icon={StopCircle}
              color="blue"
            >
              End Break
            </ActionButton>
          )}
        </div>
      </div>
    </div>
  );
};

/* SMALL COMPONENTS */

const Card = ({ icon: Icon, label, value, color }) => {
  const colors = {
    emerald: "bg-emerald-100 text-emerald-700",
    red: "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-700",
    blue: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 text-center border hover:shadow-xl transition">
      <div className={`inline-block p-4 rounded-xl mb-3 ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-xs font-medium text-slate-500 uppercase">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
};

const ActionButton = ({ children, icon: Icon, color, ...props }) => {
  const colors = {
    green: "bg-green-600 hover:bg-green-700 text-white",
    red: "bg-red-600 hover:bg-red-700 text-white",
    yellow: "bg-yellow-600 hover:bg-yellow-700 text-white",
    blue: "bg-blue-600 hover:bg-blue-700 text-white",
  };

  return (
    <button
      {...props}
      className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition shadow-md hover:scale-105 ${colors[color]}`}
    >
      <Icon className="w-5 h-5" />
      {children}
    </button>
  );
};

export default EmployeeDashboard;
