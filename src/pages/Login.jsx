import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";
import toast from "react-hot-toast";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        "/api/adminlogin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const contentType = response.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        throw new Error("Invalid response from server");
      }

      if (response.ok) {
        const userStatus = data.user?.status || (data.status !== "success" ? data.status : null);

        if (userStatus && userStatus.toLowerCase() === "inactive") {
          toast.error("Your account is disabled. Please contact the administrator.");
          setLoading(false);
          return;
        }

        toast.success("Login successful! Redirecting...");
        localStorage.setItem("userEmail", email);
        if (data.token) {
          localStorage.setItem("adminToken", data.token);
          localStorage.setItem("token", data.token);
        }
        if (data.user) {
          localStorage.setItem("userId", data.user.id || data.user._id || data.user.ID || "");
          localStorage.setItem("userRole", data.user.role || "");
          localStorage.setItem("userData", JSON.stringify(data.user));
        }
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      } else {
        toast.error(data.message || "Email or password is incorrect");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Unable to connect to server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4 py-12">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-100 rounded-full blur-[120px] opacity-60"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#64CCC5]/10 rounded-full blur-[120px] opacity-60"></div>
      </div>

      <div className="w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl p-8 sm:p-10 border border-white/20 relative overflow-hidden transition-all duration-500">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-[#04364A] mb-2 tracking-tight">
              Welcome <span className="text-sky-600">Admin</span>
            </h1>
            <p className="text-[#176B87] font-medium">Sign in to your account</p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block mb-2 text-sm font-bold text-[#04364A] tracking-wide">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="admin@mail.com"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-4 border-2 border-[#64CCC5]/30 rounded-xl focus:ring-2 focus:ring-[#64CCC5] focus:border-[#64CCC5] outline-none transition-all bg-white/50 placeholder:text-[#176B87]/40 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-bold text-[#04364A] tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-4 border-2 border-[#64CCC5]/30 rounded-xl focus:ring-2 focus:ring-[#64CCC5] focus:border-[#64CCC5] outline-none transition-all bg-white/50 placeholder:text-[#176B87]/40 pr-12 font-medium"
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-[#176B87]/40 hover:text-[#04364A] transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#04364A] text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 tracking-wider flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed mt-4 shadow-lg shadow-[#04364A]/10"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-progress {
          animation: progress 1.5s linear;
        }
      `}} />
    </div>
  );
};

export default AdminLogin;
