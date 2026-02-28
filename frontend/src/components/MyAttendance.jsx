import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { Coffee, Clock } from "lucide-react";
import { getMyAttendance } from "@/lib/api/attendanceApi";

const formatIST = (time) => {
  if (!time) return "—";

  return new Date(time).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const calculateWorkingHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return "—";

  const diffMs = new Date(checkOut) - new Date(checkIn);
  const totalMinutes = Math.floor(diffMs / 60000);

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${minutes}m`;
};

const MyAttendance = () => {
  const { user } = useAuth();
  const socket = useSocket();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH FUNCTION ================= */

  const fetchAttendance = useCallback(async () => {
    try {
      const res = await getMyAttendance();
      setRecords(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ================= INITIAL LOAD ================= */

  useEffect(() => {
    if (user) fetchAttendance();
  }, [user, fetchAttendance]);

  /* ================= SOCKET LISTENER ================= */

  useEffect(() => {
    if (!socket || !user) return;

    socket.on("attendance-update", (data) => {
      if (data.employeeId === user.employeeId) {
        fetchAttendance(); // 🔥 realtime refresh without reload
      }
    });

    socket.on("break-update", (data) => {
      if (data.employeeId === user.employeeId) {
        fetchAttendance(); // 🔥 break realtime update
      }
    });

    return () => {
      socket.off("attendance-update");
      socket.off("break-update");
    };
  }, [socket, user, fetchAttendance]);

  if (loading) {
    return (
      <p className="p-6 text-sm text-slate-500">
        Loading attendance...
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          My Attendance
        </h1>
        <p className="text-sm text-slate-500">
          View your complete attendance history
        </p>
      </div>

      {records.length === 0 && (
        <div className="bg-white rounded-xl p-6 shadow text-center text-slate-500">
          No attendance records found.
        </div>
      )}

      {/* Attendance Cards */}
      <div className="space-y-5">
        {records.map((r, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl border shadow-md hover:shadow-lg transition p-5"
          >
            {/* Date + Status */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <p className="font-semibold">
                  {new Date(r.date).toLocaleDateString("en-IN")}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  r.checkOutTime
                    ? "bg-emerald-100 text-emerald-700"
                    : r.checkInTime
                    ? "bg-blue-100 text-blue-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {r.checkOutTime
                  ? "Complete"
                  : r.checkInTime
                  ? "In Progress"
                  : "Absent"}
              </span>
            </div>

            {/* Times */}
            <div className="grid grid-cols-3 gap-4 text-center mb-4">
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-1">
                  Check-In
                </p>
                <p className="font-semibold">
                  {formatIST(r.checkInTime)}
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-1">
                  Check-Out
                </p>
                <p className="font-semibold">
                  {formatIST(r.checkOutTime)}
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-1">
                  Hours
                </p>
                <p className="font-semibold">
                  {calculateWorkingHours(
                    r.checkInTime,
                    r.checkOutTime
                  )}
                </p>
              </div>
            </div>

            {/* Break Logs */}
            {r.breaks?.length > 0 && (
              <div className="border-t pt-4 space-y-2">
                {r.breaks.map((b, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-amber-50 px-3 py-2 rounded-lg text-sm"
                  >
                    <Coffee className="w-4 h-4 text-amber-500" />
                    <span className="capitalize font-medium">
                      {b.breakType} Break
                    </span>
                    <span className="ml-auto text-xs text-slate-500">
                      {formatIST(b.startTime)} –{" "}
                      {formatIST(b.endTime)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyAttendance;