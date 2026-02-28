import { useState, useEffect } from "react";
import { CalendarX, UserPlus } from "lucide-react";
import { useToast } from "../hooks/use-toast";

import { getEmployees } from "../lib/api/employeeApi";
import { markNotAttended, getMyMissedMeetings } from "../lib/api/meetingApi";

const formatIST = (date) => {
  if (!date) return "-";

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

const MeetingAttendance = () => {
  const { toast } = useToast();

  const [missed, setMissed] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState("");
  const [meetingDate, setMeetingDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [filter, setFilter] = useState("");

  /*
  ================================
  LOAD EMPLOYEES + MISSED MEETINGS
  ================================
  */

  useEffect(() => {
    const fetchData = async () => {
      try {
        const empRes = await getEmployees();
        const missedRes = await getMyMissedMeetings();

        console.log("EMPLOYEES:", empRes.data);
        console.log("MISSED:", missedRes.data);

        // ensure employees always array
        if (Array.isArray(empRes.data)) {
          setEmployees(empRes.data);
        } else if (Array.isArray(empRes.data?.employees)) {
          setEmployees(empRes.data.employees);
        } else {
          setEmployees([]);
        }

        // ensure missed meetings array
        if (Array.isArray(missedRes.data)) {
          setMissed(missedRes.data);
        } else {
          setMissed([]);
        }

      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  /*
  ================================
  MARK ABSENT
  ================================
  */

  const handleMark = async (e) => {
    e.preventDefault();

    if (!selectedEmp) {
      toast({
        title: "Error",
        description: "Select an employee",
        variant: "destructive",
      });
      return;
    }

    try {
      // backend expects `date` property, not `meetingDate`
      const res = await markNotAttended({
        employeeId: selectedEmp,
        date: meetingDate,
      });

      // enrich with display name and map field names to match getMyMissedMeetings structure
      const apiEntry = res.data;
      const newEntry = {
        employeeId: apiEntry.employeeId,
        meetingDate: apiEntry.date, // backend returns 'date', but list expects 'meetingDate'
        markedAt: apiEntry.markedAt,
        employeeName:
          employees.find((e) => e.employee_id === selectedEmp)?.name || "",
      };

      setMissed([newEntry, ...missed]);
      setShowForm(false);
      setSelectedEmp("");

      toast({
        title: "Marked Absent",
        description: `Employee marked absent for meeting on ${meetingDate}`,
      });

    } catch (err) {
      console.error(err);

      toast({
        title: "Error",
        description: "Failed to mark attendance",
        variant: "destructive",
      });
    }
  };

  /*
  ================================
  FILTER
  ================================
  */

  const filtered = (Array.isArray(missed) ? missed : []).filter(
    (m) =>
      !filter ||
      m.employeeName?.toLowerCase().includes(filter.toLowerCase()) ||
      m.employeeId?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>

      {/* HEADER */}

      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1>Meeting Attendance</h1>
          <p>Track and mark employees absent for meetings</p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="action-button-primary self-start"
        >
          <CalendarX className="w-4 h-4" />
          {showForm ? "Cancel" : "Mark Absent"}
        </button>
      </div>

      {/* FORM */}

      {showForm && (
        <div className="bg-card border rounded-xl p-5 mb-6 shadow-stat animate-slide-up">

          <h3 className="text-sm font-semibold mb-4 text-card-foreground">
            Mark Employee Absent
          </h3>

          <form
            onSubmit={handleMark}
            className="flex flex-col sm:flex-row gap-3 items-end"
          >

            {/* EMPLOYEE SELECT */}

            <div className="flex-1">
              <label className="text-xs font-medium text-foreground mb-1 block">
                Employee
              </label>

              <select
                value={selectedEmp}
                onChange={(e) => setSelectedEmp(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select employee</option>

                {(Array.isArray(employees) ? employees : []).map((emp) => (
                  <option
                    key={emp.employee_id}
                    value={emp.employee_id}
                  >
                    {emp.name} ({emp.employee_id})
                  </option>
                ))}

              </select>
            </div>

            {/* DATE */}

            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">
                Meeting Date
              </label>

              <input
                type="date"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                className="h-10 px-3 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* BUTTON */}

            <button type="submit" className="action-button-primary h-10">
              <UserPlus className="w-4 h-4" />
              Mark
            </button>

          </form>
        </div>
      )}

      {/* FILTER */}

      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter by employee..."
        className="w-full max-w-sm h-10 px-3 rounded-lg border bg-card text-foreground text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-ring"
      />

      {/* LIST */}

      <div className="space-y-3">

  {filtered.map((m) => {
    const itemKey = `${m.employeeId || ""}-${m.meetingDate || ""}`;

    return (
      <div key={itemKey} className="stat-card flex items-center gap-4">

        <div className="w-10 h-10 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center flex-shrink-0">
          <CalendarX className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-card-foreground">
            {m.employeeName}
          </p>
          <p className="text-xs text-muted-foreground mono">
            {m.employeeId}
          </p>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="text-sm font-medium text-card-foreground">
            {formatIST(m.meetingDate)}
          </p>
          <p className="text-xs text-muted-foreground">
            Marked at {formatIST(m.markedAt)}
          </p>
        </div>

      </div>
    );
  })}

</div>
    </div>
  );
};

export default MeetingAttendance;