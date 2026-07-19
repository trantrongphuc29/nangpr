import { useTheme } from "../context/ThemeContext";

export default function Header({ setOpen }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="print:hidden sticky top-0 z-40 border-b border-outline flex justify-between items-center px-4 md:px-6 h-14 transition-colors duration-150"
      style={{ backgroundColor: "var(--color-card-bg)" }}
    >
      {/* Left */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOpen(true)}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-primary/[0.06] text-on-surface-variant transition-colors"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-colors duration-150 text-on-surface-variant"
          title={isDark ? "Chế độ sáng" : "Chế độ tối"}
        >
          <span className="material-symbols-outlined text-[20px]">
            {isDark ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        <div className="ml-2 border-l border-outline pl-3">
          <p className="text-sm font-medium text-on-surface leading-tight">Admin</p>
        </div>
      </div>
    </header>
  );
}
