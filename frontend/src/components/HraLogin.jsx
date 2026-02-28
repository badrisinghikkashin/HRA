import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ClipboardCheck, Eye, EyeOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!employeeId.trim() || !password.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const success = await login(employeeId, password);
      setLoading(false);

      if (success) {
        const stored = localStorage.getItem("hra_user");
        const userData = stored ? JSON.parse(stored) : null;

        toast({
          title: "Welcome back!",
          description: `Logged in as ${userData?.employeeId || "User"}`,
        });

        const role = userData?.role?.toLowerCase();

        if (role === "admin") navigate("/admin", { replace: true });
        else if (role === "employee") navigate("/employee", { replace: true });
        else navigate("/", { replace: true });

      } else {
        toast({
          title: "Login Failed",
          description: "Invalid Employee ID or password",
          variant: "destructive",
        });
      }
    } catch (err) {
      setLoading(false);
      toast({
        title: "Error",
        description: err.message || "An error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 px-4 py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo / Header */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 backdrop-blur-xl p-4 rounded-2xl">
              <ClipboardCheck size={48} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            HRA System
          </h1>
          <p className="text-white/80 text-sm font-medium">
            Human Resource Attendance Management
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 animate-slideUp">

          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-600 text-sm mb-8">
            Sign in to your account to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Employee ID */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Employee ID
              </label>

              <input
                type="text"
                placeholder="Enter your Employee ID"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                disabled={loading}
                className="
                  w-full
                  px-4 py-3
                  rounded-xl
                  border-2 border-gray-200
                  bg-white
                  text-gray-800
                  placeholder-gray-400
                  focus:outline-none
                  focus:ring-0
                  focus:border-blue-500
                  focus:bg-blue-50/30
                  transition duration-300
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
              />
            </div>

            {/* Password */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="
                    w-full
                    px-4 py-3
                    rounded-xl
                    border-2 border-gray-200
                    bg-white
                    text-gray-800
                    placeholder-gray-400
                    focus:outline-none
                    focus:ring-0
                    focus:border-blue-500
                    focus:bg-blue-50/30
                    transition duration-300
                    disabled:opacity-60 disabled:cursor-not-allowed
                  "
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition disabled:opacity-60"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                py-3
                rounded-xl
                bg-gradient-to-r from-blue-600 to-purple-600
                hover:from-blue-700 hover:to-purple-700
                text-white
                font-bold
                text-lg
                transition duration-300
                transform hover:scale-105
                hover:shadow-lg
                disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100
                active:scale-95
              "
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <Loader2 size={20} className="animate-spin" />
                  <span>Signing in...</span>
                </span>
              ) : (
                "Sign In"
              )}
            </button>

          </form>

          {/* Demo Credentials */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-5 border border-blue-100">
            <p className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-lg">🔑</span> Demo Credentials
            </p>

            <div className="space-y-4">
              <div className="bg-white rounded-lg p-3">
                <p className="font-semibold text-gray-800 text-sm">👨‍💼 Admin Account</p>
                <div className="mt-1 font-mono text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  <div>ID: <span className="text-gray-800 font-bold">ADMIN001</span></div>
                  <div>Pass: <span className="text-gray-800 font-bold">admin123</span></div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-3">
                <p className="font-semibold text-gray-800 text-sm">👤 Employee Account</p>
                <div className="mt-1 font-mono text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  <div>ID: <span className="text-gray-800 font-bold">EMP001</span></div>
                  <div>Pass: <span className="text-gray-800 font-bold">emp123</span></div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <p className="text-center text-white/70 text-xs mt-6">
          Secure Human Resource Management System
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.6s ease-out 0.2s both;
        }
      `}</style>
    </div>
  );
};

export default Login;