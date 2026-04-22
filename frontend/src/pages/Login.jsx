import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const res = await login({
        username,
        password,
      });
      
      // Chỉ lưu token vào localStorage
      localStorage.setItem("token", res.token);   

      setMsg("");
      alert("Đăng nhập thành công!");
      navigate("/");   // Điều hướng về trang chủ
    } catch (err) {
      console.error("Lỗi login:", err);
      const errorMsg = err.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại!";
      setMsg(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf5] relative">
      {/* background glow */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-yellow-200/20 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-orange-200/10 blur-[120px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 p-6 items-center">

        {/* LEFT SIDE */}
        <div className="hidden md:flex flex-col space-y-6 pr-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-200 text-xs font-bold uppercase tracking-widest">
              Admin 
            </div>
            <h1 className="text-5xl font-black mt-4">
              Nắng PR <span className="block text-[#553722]">Atelier</span>
            </h1>
            <p className="mt-4 text-gray-600 max-w-md">
              Chào mừng trở lại. Hãy đăng nhập để quản lý phần mềm.
            </p>
          </div>

          <img
            src={`https://picsum.photos/600/400?random=${Math.random()}`}
            alt="login"
            className="rounded-xl shadow-lg object-cover h-[300px]"
          />
        </div>

        {/* RIGHT SIDE - FORM */}
        <div className="flex justify-center">
          <div className="w-full max-w-md bg-white p-10 rounded-xl shadow-lg border">

            <div className="mb-8 text-center md:text-left">
              <h2 className="text-3xl font-bold">Đăng nhập</h2>
              <p className="text-gray-500 mt-1">Hệ thống quản lý nội bộ</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="text-sm font-semibold">Tên đăng nhập</label>
                <div className="relative mt-1">
                  <input
                    type="text"
                    className="w-full px-5 py-4 bg-gray-100 rounded-lg focus:ring-2 focus:ring-[#553722] outline-none"
                    placeholder="admin_nangpr"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold">Mật khẩu</label>
                <div className="relative mt-1">
                  <input
                    type="password"
                    className="w-full px-5 py-4 bg-gray-100 rounded-lg focus:ring-2 focus:ring-[#553722] outline-none"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-lg font-bold text-white disabled:opacity-70"
                style={{ background: "linear-gradient(135deg, #553722, #6f4e37)" }}
              >
                {loading ? "Đang đăng nhập..." : "Vào hệ thống →"}
              </button>

              {msg && <p className="text-red-500 text-center font-medium">{msg}</p>}
            </form>

            <div className="mt-10 text-center text-xs text-gray-400">
              © 2026 Nắng PR Management
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}