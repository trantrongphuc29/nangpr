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
      const res = await login({ username, password });
      localStorage.setItem("token", res.token);
      alert("Đăng nhập thành công!");
      navigate("/");
    } catch (err) {
      console.error("Lỗi login:", err);
      const errorMsg = err.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại!";
      setMsg(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Thêm transition-none và dùng màu hex trực tiếp để không bị biến CSS ghi đè
    <div className="min-h-screen flex items-center justify-center !bg-[#fafaf5] relative transition-none">
      {/* background glow - Giữ nguyên màu vàng/cam tươi sáng */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-yellow-200/40 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-orange-200/20 blur-[120px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 p-4 md:p-6 items-center">

        {/* LEFT SIDE */}
        <div className="hidden lg:flex flex-col space-y-6 lg:pr-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full !bg-yellow-200 !text-black text-xs font-bold uppercase tracking-widest">
              Admin 
            </div>
            <h1 className="text-5xl font-black mt-4 !text-black">
              Nắng PR <span className="block !text-[#553722]">Atelier</span>
            </h1>
            <p className="mt-4 !text-gray-600 max-w-md font-medium">
              Chào mừng trở lại. Hãy đăng nhập để quản lý phần mềm.
            </p>
          </div>

          <img
            src={`https://picsum.photos/600/400?random=1`}
            alt="login"
            className="rounded-xl shadow-lg object-cover h-[300px] border-4 border-white"
          />
        </div>

        {/* RIGHT SIDE - FORM (Dùng dấu ! quan trọng để ép màu trắng) */}
        <div className="flex justify-center">
          <div className="w-full max-w-md !bg-white p-10 rounded-xl shadow-lg border !border-gray-100">

            <div className="mb-8 text-center md:text-left">
              <h2 className="text-3xl font-bold !text-black">Đăng nhập</h2>
              <p className="!text-gray-500 mt-1">Hệ thống quản lý nội bộ</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="text-sm font-semibold !text-black">Tên đăng nhập</label>
                <div className="relative mt-1">
                  <input
                    type="text"
                    // Ép màu nền xám nhạt và chữ đen cho input
                    className="w-full px-5 py-4 !bg-gray-100 !text-black rounded-lg focus:ring-2 focus:ring-[#553722] outline-none border-none"
                    placeholder="admin_nangpr"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2">👤</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold !text-black">Mật khẩu</label>
                <div className="relative mt-1">
                  <input
                    type="password"
                    className="w-full px-5 py-4 !bg-gray-100 !text-black rounded-lg focus:ring-2 focus:ring-[#553722] outline-none border-none"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2">🔒</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-lg font-bold !text-white disabled:opacity-70 shadow-md active:scale-95 transition-transform"
                style={{ background: "linear-gradient(135deg, #553722, #6f4e37)" }}
              >
                {loading ? "Đang đăng nhập..." : "Vào hệ thống →"}
              </button>

              {msg && <p className="!text-red-500 text-center font-medium">{msg}</p>}
            </form>

            <div className="mt-10 text-center text-xs !text-gray-400">
              © 2026 Nắng PR Management
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}