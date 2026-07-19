import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { useTheme } from "../context/ThemeContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden transition-colors duration-150"
      style={{ backgroundColor: "var(--color-main-bg)" }}
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--color-primary) 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Theme toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        className="fixed top-5 right-5 z-20 w-10 h-10 rounded-xl flex items-center justify-center border transition-colors duration-150"
        style={{
          backgroundColor: "var(--color-card-bg)",
          borderColor: "var(--color-border)",
          color: "var(--color-muted)",
        }}
        aria-label="Đổi chế độ sáng tối"
      >
        <span className="material-symbols-outlined text-xl">
          {isDark ? "light_mode" : "dark_mode"}
        </span>
      </button>

      <div className="relative z-10 w-full max-w-[400px] mx-4">
        {/* Branding */}
        <div className="text-center mb-8">
          <img
            src={`${process.env.PUBLIC_URL}/logoNangPR.svg`}
            alt="Nắng PR"
            className="h-20 w-auto object-contain mx-auto mb-4"
          />
          <p className="text-sm text-muted">Hệ thống quản lý quán cà phê</p>
        </div>

        {/* Login card */}
        <div className="card-elevated p-7">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-on-surface">Đăng nhập</h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[13px] font-medium text-on-surface mb-1.5 block">Tên đăng nhập</label>
              <div className="relative">
                <span className="material-symbols-outlined text-lg text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">person</span>
                <input
                  type="text"
                  className="input-field !pl-10"
                  placeholder="Nhập tên đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[13px] font-medium text-on-surface mb-1.5 block">Mật khẩu</label>
              <div className="relative">
                <span className="material-symbols-outlined text-lg text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">lock</span>
                <input
                  type={showPass ? "text" : "password"}
                  className="input-field !pl-10 !pr-10"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-on-surface transition-colors"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined text-lg">{showPass ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
            </div>

            {msg && (
              <div className="flex items-center gap-2 p-3 rounded-lg text-sm"
                style={{
                  backgroundColor: "var(--color-error-bg)",
                  border: "1px solid var(--color-error-border)",
                  color: "var(--color-error)",
                }}
              >
                <span className="material-symbols-outlined text-base shrink-0">error</span>
                {msg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !username || !password}
              className="btn-primary w-full !py-3 !text-[14px] disabled:opacity-50 disabled:cursor-not-allowed !mt-6"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                  Đang đăng nhập...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">login</span>
                  Đăng nhập
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
