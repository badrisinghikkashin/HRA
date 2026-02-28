// import { useState, useEffect } from "react";
// import { getEmployees } from "@/lib/api/employeeApi";
// import { getAttendance, getMyAttendance } from "@/lib/api/attendanceApi";
// import { useAuth } from "@/context/AuthContext";

// export const DebugDataViewer = () => {
//   const { user } = useAuth();
//   const [data, setData] = useState({
//     employees: null,
//     attendance: null,
//     myAttendance: null,
//     errors: {}
//   });

//   const fetchAllData = async () => {
//     const newErrors = {};

//     try {
//       const empRes = await getEmployees();
//       console.log("✅ EMPLOYEES RESPONSE:", empRes.data);
//     } catch (err) {
//       console.error("❌ EMPLOYEES ERROR:", err.message);
//       newErrors.employees = err.message;
//     }

//     try {
//       const attRes = await getAttendance();
//       console.log("✅ ATTENDANCE RESPONSE:", attRes.data);
//     } catch (err) {
//       console.error("❌ ATTENDANCE ERROR:", err.message);
//       newErrors.attendance = err.message;
//     }

//     try {
//       const myRes = await getMyAttendance();
//       console.log("✅ MY ATTENDANCE RESPONSE:", myRes.data);
//     } catch (err) {
//       console.error("❌ MY ATTENDANCE ERROR:", err.message);
//       newErrors.myAttendance = err.message;
//     }

//     setData(prev => ({
//       ...prev,
//       errors: newErrors
//     }));
//   };

//   useEffect(() => {
//     if (user) fetchAllData();
//   }, [user]);

//   return (
//     <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg max-w-md max-h-96 overflow-auto text-xs font-mono">
//       <div className="font-bold mb-2">🐛 DEBUG DATA</div>
//       <div className="space-y-2">
//         <div>User: {user?.employeeId}</div>
//         <button
//           onClick={fetchAllData}
//           className="bg-blue-600 px-2 py-1 rounded text-xs font-bold"
//         >
//           🔄 Fetch Data
//         </button>
//         <div className="bg-gray-700 p-2 rounded mt-2">
//           <div className="font-bold">Errors:</div>
//           <pre>{JSON.stringify(data.errors, null, 2)}</pre>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DebugDataViewer;
