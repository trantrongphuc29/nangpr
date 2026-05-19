import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext"; // Đảm bảo bạn đã có ThemeContext

export default function Header({ setOpen }) {
  const [user, setUser] = useState(null);
  const { isDark, toggleTheme } = useTheme(); // Lấy hàm đổi màu

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  return (
    <header className="print:hidden sticky top-0 z-40 bg-[var(--color-card-bg)] border-b border-[var(--color-border)] shadow-sm flex justify-between items-center px-4 md:px-6 py-3 transition-colors duration-500">
      
      {/* LEFT */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setOpen(true)}
          className="lg:hidden p-2 rounded-xl hover:bg-primary/10 text-on-surface"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        
        {/* NÚT SÁNG TỐI DUY NHẤT */}
        <button 
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-[var(--color-main-bg)] border border-[var(--color-border)] transition-all active:scale-90 flex items-center justify-center"
        >
          <span className="material-symbols-outlined transition-all text-primary">
            {isDark ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        <button className="p-2 rounded-xl hover:bg-primary/10 text-on-surface">
          <span className="material-symbols-outlined">notifications</span>
        </button>

        <div className="flex items-center gap-3 ml-2 border-l border-[var(--color-border)] pl-4">
          <div className="text-right hidden md:block">
            <p className="text-xs font-black text-primary uppercase tracking-tighter">
              {user?.username || "Admin"}
            </p>
          </div>

          <img
            src="https://i.pravatar.cc/40"
            className="w-9 h-9 rounded-xl border-2 border-[var(--color-border)]"
            alt="avatar"
          />
        </div>
      </div>
    </header>
  );
}