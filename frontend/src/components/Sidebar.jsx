import { NavLink, useNavigate } from "react-router-dom";

export default function Sidebar({ open, setOpen }) {
  const navigate = useNavigate();

  const menu = [
    { name: "Dashboard", path: "/dashboard", icon: "dashboard" },
    { name: "Bán hàng", path: "/pos", icon: "point_of_sale" },
    { name: "Doanh thu", path: "/doanhthu", icon: "payments" },
    { name: "Công nợ", path: "/congno", icon: "account_balance" },
    { name: "Món & Công thức", path: "/menu", icon: "restaurant_menu" },
    { name: "Nguyên liệu", path: "/nguyenlieu", icon: "inventory_2" },
    { name: "Nhân viên", path: "/nhanvien", icon: "badge" },
    { name: "Bảng công", path: "/bangcong", icon: "schedule" },
    { name: "Bảng lương", path: "/bangluong", icon: "payments" },
    { name: "Cấu hình lương", path: "/luongnhanvien", icon: "tune" },
    { name: "Quản lý bàn", path: "/ban", icon: "table_restaurant" },
  ];

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:3000/api/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    }
    localStorage.clear();
    navigate("/login");
  };

  return (
    <>
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="print:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`print:hidden
          fixed top-0 left-0 z-50 h-full flex flex-col
          border-r border-outline transition-transform duration-200
          w-[260px]
          transform ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
        style={{ backgroundColor: "var(--sidebar-bg)" }}
      >
        {/* Mobile close */}
        <div className="flex justify-between items-center px-4 py-3 lg:hidden border-b border-outline">
          <span className="text-xs font-medium text-muted uppercase tracking-wider">Menu</span>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary/8 text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-xl text-white" style={{ color: "var(--color-btn-text)" }}>coffee</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-[15px] font-bold text-on-surface leading-tight tracking-tight">Nắng PR</h1>
            <p className="text-[11px] text-muted font-medium mt-0.5">Quản lý quán</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-1 px-3 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {menu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 mb-0.5 relative ${
                  isActive
                    ? "text-primary font-semibold"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-primary/[0.04]"
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? { backgroundColor: "var(--sidebar-active-bg)" }
                  : undefined
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div
                      className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full"
                      style={{ backgroundColor: "var(--sidebar-active-border)" }}
                    />
                  )}
                  <span className="material-symbols-outlined text-[20px] shrink-0">{item.icon}</span>
                  <span className="text-[13px]">{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-outline space-y-0.5">
          <button className="flex items-center gap-3 px-3 py-2.5 text-on-surface-variant hover:text-on-surface hover:bg-primary/[0.04] rounded-lg w-full transition-colors duration-150">
            <span className="material-symbols-outlined text-[20px]">help</span>
            <span className="text-[13px] font-medium">Hỗ trợ</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 text-error/70 hover:text-error hover:bg-error/[0.04] rounded-lg w-full transition-colors duration-150"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span className="text-[13px] font-medium">Đăng xuất</span>
          </button>
        </div>
      </aside>
    </>
  );
}
