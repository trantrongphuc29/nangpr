import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";

export default function Header({ setOpen }) {
  const [user, setUser] = useState(null);
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  return (
    <header className="print:hidden sticky top-0 z-40 border-b border-outline flex justify-between items-center px-4 md:px-6 h-14 transition-colors duration-150"
      style={{ backgroundColor: "var(--color-card-bg)" }}
    >
      {/* Left */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOpen(true)}
          className="lg:hidden p-2 rounded-lg hover:bg-primary/[0.06] text-on-surface-variant transition-colors"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-[var(--color-surface-container-high)] transition-colors duration-150 text-on-surface-variant"
          title={isDark ? "Chế độ sáng" : "Chế độ tối"}
        >
          <span className="material-symbols-outlined text-[20px]">
            {isDark ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        <button className="p-2 rounded-lg hover:bg-[var(--color-surface-container-high)] transition-colors duration-150 text-on-surface-variant">
          <span className="material-symbols-outlined text-[20px]">notifications</span>
        </button>

        <div className="flex items-center gap-2.5 ml-2 border-l border-outline pl-3">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-on-surface leading-tight">
              {user?.username || "Admin"}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-[13px] font-semibold"
            style={{ color: "var(--color-btn-text)" }}
          >
            {(user?.username || "A").charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
