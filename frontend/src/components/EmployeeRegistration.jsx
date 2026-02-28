import { useState, useEffect } from "react";
import { getEmployees} from "../lib/api/employeeApi";
import { registerEmployee } from "../lib/api/authApi";
import { UserPlus, Search } from "lucide-react";
import { useToast } from "../hooks/use-toast";

const EmployeeRegistration = () => {
  const { toast } = useToast();

  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await getEmployees();

        console.log("EMPLOYEES API RESPONSE:", res.data);

        // ensure employees always array
        if (Array.isArray(res.data)) {
          setEmployees(res.data);
        } else if (Array.isArray(res.data?.employees)) {
          setEmployees(res.data.employees);
        } else {
          setEmployees([]);
        }

      } catch (err) {
        console.error(err);
        setEmployees([]);
      }
    };

    fetchEmployees();
  }, []);

  const nextId = `EMP${String(employees.length + 1).padStart(3, "0")}`;

 const handleRegister = async (e) => {
  e.preventDefault();

  if (!form.name || !form.email || !form.phone || !form.password) {
    toast({
      title: "Validation Error",
      description: "All fields are required",
      variant: "destructive",
    });
    return;
  }

  try {
    const res = await registerEmployee(form);
    const newEmp = res.data;

    setEmployees([...employees, newEmp]);
    setForm({ name: "", email: "", phone: "", password: "" });
    setShowForm(false);

    toast({
      title: "Employee Registered",
      description: `${newEmp.name} registered successfully`,
    });
  } catch (err) {
    console.error(err);
    toast({
      title: "Error",
      description: "Failed to register employee",
      variant: "destructive",
    });
  }
};

  // safe filter
  const filtered = (Array.isArray(employees) ? employees : []).filter(
    (e) =>
      e.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Employee Registration
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Register and manage employees
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl
          bg-gradient-to-r from-blue-600 to-indigo-600 text-white
          hover:shadow-lg hover:scale-[1.02] transition"
        >
          <UserPlus className="w-4 h-4" />
          {showForm ? "Cancel" : "Register Employee"}
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-700">

          <h3 className="font-semibold text-lg mb-1">
            Add New Employee
          </h3>

          <p className="text-xs text-slate-500 mb-5">
            Auto ID:
            <span className="ml-2 font-semibold text-blue-600">
              {nextId}
            </span>
          </p>

          <form onSubmit={handleRegister} className="grid sm:grid-cols-2 gap-5">

            {/* Name */}
            <div>
              <label className="text-xs font-semibold text-slate-600">
                Full Name
              </label>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                className="mt-1 w-full h-11 px-4 rounded-xl border
                border-slate-300 dark:border-slate-700
                bg-slate-50 dark:bg-slate-800
                focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="John Doe"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-slate-600">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                className="mt-1 w-full h-11 px-4 rounded-xl border
                border-slate-300 dark:border-slate-700
                bg-slate-50 dark:bg-slate-800
                focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="john@company.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-semibold text-slate-600">
                Phone
              </label>
              <input
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
                className="mt-1 w-full h-11 px-4 rounded-xl border
                border-slate-300 dark:border-slate-700
                bg-slate-50 dark:bg-slate-800
                focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="9876543210"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold text-slate-600">
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                className="mt-1 w-full h-11 px-4 rounded-xl border
                border-slate-300 dark:border-slate-700
                bg-slate-50 dark:bg-slate-800
                focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="••••••"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl font-semibold
                bg-gradient-to-r from-blue-600 to-indigo-600
                text-white hover:shadow-lg transition"
              >
                Register Employee
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search employees..."
          className="w-full h-11 pl-10 pr-4 rounded-xl border
          border-slate-300 dark:border-slate-700
          bg-white dark:bg-slate-900
          focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">

        <div className="overflow-x-auto">
          <table className="w-full text-sm">

            <thead className="bg-slate-100 dark:bg-slate-800">
              <tr>
                <th className="px-5 py-3 text-left">ID</th>
                <th className="px-5 py-3 text-left">Name</th>
                <th className="px-5 py-3 hidden sm:table-cell text-left">Email</th>
                <th className="px-5 py-3 hidden md:table-cell text-left">Phone</th>
                <th className="px-5 py-3 hidden lg:table-cell text-left">Joined</th>
              </tr>
            </thead>

            <tbody>
  {filtered.map((emp) => (
    <tr
      key={emp.employee_id}
      className="border-t hover:bg-slate-50 dark:hover:bg-slate-800 transition"
    >
      <td className="px-5 py-3 text-blue-600 font-semibold">
        {emp.employee_id}
      </td>
      <td className="px-5 py-3 font-medium">{emp.name}</td>
      <td className="px-5 py-3 hidden sm:table-cell">{emp.email}</td>
      <td className="px-5 py-3 hidden md:table-cell">{emp.phone}</td>
      <td className="px-5 py-3 hidden lg:table-cell">{emp.created_at}</td>
    </tr>
  ))}
</tbody>

          </table>
        </div>

      </div>
    </div>
  );
};

export default EmployeeRegistration;