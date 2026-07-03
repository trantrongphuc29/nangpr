import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { useTheme } from "../context/ThemeContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const res = await login({ username, password });
      localStorage.setItem("token", res.token);
      navigate("/dashboard");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại!";
      setMsg(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-container-low relative transition-colors duration-300">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/15 blur-[120px]" />
      </div>

      <button
        type="button"
        onClick={toggleTheme}
        className="fixed top-5 right-5 z-20 p-2.5 rounded-xl bg-card border border-outline text-primary hover:bg-primary/10 transition-all active:scale-95"
        aria-label="Đổi chế độ sáng tối"
      >
        <span className="material-symbols-outlined">
          {isDark ? "light_mode" : "dark_mode"}
        </span>
      </button>

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 p-4 md:p-6 items-center">
        <div className="hidden lg:flex flex-col space-y-6 lg:pr-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full badge-accent text-xs font-bold uppercase tracking-widest">
              Admin
            </div>
            <h1 className="text-5xl font-black mt-4 text-on-surface">
              Nắng PR <span className="block text-primary">Atelier</span>
            </h1>
            <p className="mt-4 text-muted max-w-md font-medium">
              Chào mừng trở lại. Hãy đăng nhập để quản lý quán cafe nội bộ.
            </p>
          </div>
          <img
            src="https://picsum.photos/600/400?random=1"
            alt="Cafe atelier"
            className="rounded-2xl shadow-lg object-cover h-[300px] border-2 border-outline"
          />
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-md card p-8 md:p-10 rounded-2xl">
            <div className="mb-8 text-center md:text-left">
              <h2 className="text-3xl font-bold text-on-surface">Đăng nhập</h2>
              <p className="text-muted mt-1 text-sm">Hệ thống quản lý nội bộ</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-on-surface">Tên đăng nhập</label>
                <div className="relative mt-1">
                  <input
                    type="text"
                    className="input-field !pr-12"
                    placeholder="admin_nangpr"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted material-symbols-outlined text-xl">
                    person
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-on-surface">Mật khẩu</label>
                <div className="relative mt-1">
                  <input
                    type="password"
                    className="input-field !pr-12"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted material-symbols-outlined text-xl">
                    lock
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full !py-4 disabled:opacity-60"
              >
                {loading ? "Đang đăng nhập..." : "Vào hệ thống →"}
              </button>

              {msg && (
                <p className="text-error text-center text-sm font-medium bg-error-container/50 py-2 px-3 rounded-xl border border-error/20">
                  {msg}
                </p>
              )}
            </form>

            <p className="mt-10 text-center text-xs text-muted">
              © 2026 Nắng PR Management
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
