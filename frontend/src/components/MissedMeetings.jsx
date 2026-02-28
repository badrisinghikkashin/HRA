import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { CalendarX } from "lucide-react";
import { getMyMissedMeetings } from "../lib/api/meetingApi";

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

const MissedMeetings = () => {
  const { user } = useAuth();
  const [myMissed, setMyMissed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMissed = async () => {
      try {
        const res = await getMyMissedMeetings();
        setMyMissed(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMissed();
    }
  }, [user]);

  if (loading) {
    return (
      <p className="p-6 text-sm text-slate-500">
        Loading missed meetings...
      </p>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Missed Meetings
        </h1>
        <p className="text-sm text-slate-500">
          Meetings you were marked absent for
        </p>
      </div>

      {myMissed.length === 0 ? (
        /* EMPTY STATE */
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-12 text-center">

          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CalendarX className="w-8 h-8" />
          </div>

          <p className="font-semibold text-lg text-slate-900 dark:text-white">
            No missed meetings 🎉
          </p>

          <p className="text-sm text-slate-500 mt-2">
            Great job keeping up with all your meetings!
          </p>

        </div>
      ) : (
        /* MEETING LIST */
        <div className="space-y-4">
          {myMissed.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-4 p-5 rounded-2xl
              bg-white dark:bg-slate-900
              border border-slate-200 dark:border-slate-700
              shadow-md hover:shadow-lg transition"
            >

              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                <CalendarX className="w-5 h-5" />
              </div>

              {/* Content */}
              <div className="flex-1">
  <p className="font-semibold text-slate-900 dark:text-white">
    Meeting on {formatIST(m.meetingDate)}
  </p>

  <p className="text-xs text-slate-500 mt-1">
    Marked absent at {formatIST(m.markedAt)}
  </p>
</div>

              {/* Badge */}
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                Absent
              </span>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MissedMeetings;