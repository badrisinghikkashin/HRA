import { useState, useEffect } from "react";
import { getAttendance } from "@/lib/api/attendanceApi";
import { Search, Filter } from "lucide-react";

const formatIST = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDateOnlyIST = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
const AttendanceMonitoring = () => {
  const [attendance, setAttendance] = useState([]);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(true);

  /* ================= FETCH DATA ================= */

  const fetchAttendance = async () => {
    try {
      const res = await getAttendance();

      // Safe handling
      setAttendance(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Attendance fetch error:", err);
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  /* ================= FILTER LOGIC ================= */

  const filtered = attendance.filter((a) => {
    const matchSearch =
      a.employeeName?.toLowerCase().includes(search.toLowerCase()) ||
      a.employeeId?.toLowerCase().includes(search.toLowerCase());

    const matchDate = !dateFilter || a.date?.split("T")[0] === dateFilter;

    return matchSearch && matchDate;
  });

  /* ================= BREAK DURATION ================= */

  const getBreakDuration = (breaks = []) => {
    if (!breaks.length) return "—";

    return breaks
      .map((b) => {
        if (!b.endTime) return "Ongoing";

        const start = new Date(b.startTime);
        const end = new Date(b.endTime);

        const diffMin = Math.floor((end - start) / 60000);

        return `${diffMin} min`;
      })
      .join(", ");
  };

  /* ================= LOADING ================= */

  if (loading) {
    return <p className="p-6 text-slate-500 text-sm">Loading attendance...</p>;
  }

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Attendance Monitoring</h1>
        <p className="text-sm text-slate-500">
          Track employee check-ins & check-outs
        </p>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employee..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border
              bg-white border-slate-200
              text-sm focus:ring-2 focus:ring-blue-500
              outline-none shadow-sm"
          />
        </div>

        {/* Date Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-11 pl-10 pr-4 rounded-xl border
              bg-white border-slate-200
              text-sm focus:ring-2 focus:ring-blue-500
              outline-none shadow-sm"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-slate-600">
                <th className="px-5 py-3 text-left font-semibold">Employee</th>
                <th className="px-5 py-3 text-left font-semibold">Date</th>
                <th className="px-5 py-3">Check-In</th>
                <th className="px-5 py-3">Check-Out</th>
                <th className="px-5 py-3">Break Duration</th>
                <th className="px-5 py-3">Working Hours</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className="border-b hover:bg-slate-50 transition"
                >
                  <td className="px-5 py-3">
                    <p className="font-semibold">{r.employeeName}</p>
                    <p className="text-xs text-slate-500">{r.employeeId}</p>
                  </td>

                  <td className="px-5 py-3 text-xs">
                    {formatDateOnlyIST(r.date)}
                  </td>

                  <td className="px-5 py-3 text-xs">
                    {formatIST(r.checkInTime)}
                  </td>

                  <td className="px-5 py-3 text-xs">
                    {formatIST(r.checkOutTime)}
                  </td>

                  <td className="px-5 py-3 text-xs">
                    {getBreakDuration(r.breaks)}
                  </td>

                  <td className="px-5 py-3 text-xs">{r.workingHours || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceMonitoring;
