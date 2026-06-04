import { NavLink, useNavigate } from "react-router-dom";

export default function Sidebar({ open, setOpen }) {
  const navigate = useNavigate();

 const menu = [
    { name: "Dashboard", path: "/", icon: "dashboard" },
    { name: "Bán hàng", path: "/pos", icon: "point_of_sale" },
    { name: "Nhân viên", path: "/nhanvien", icon: "badge" },
    { name: "Món & Công thức", path: "/menu", icon: "restaurant_menu" }, //  Đã gộp chung chuẩn chỉnh
    { name: "Nguyên liệu", path: "/nguyenlieu", icon: "inventory_2" },
    { name: "Quản lý Bàn", path: "/ban", icon: "table_restaurant" },
    { name: "Doanh thu", path: "/doanhthu", icon: "payments" },
    { name: "Bảng công", path: "/bangcong", icon: "schedule" },
    { name: "Bảng lương", path: "/bangluong", icon: "payments" },
    { name: "Cấu hình lương", path: "/luongnhanvien", icon: "tune" },
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
      {/* OVERLAY MOBILE: Hiệu ứng kính mờ khi mở Sidebar trên điện thoại */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="print:hidden fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-all duration-300"
        />
      )}

      {/* SIDEBAR CONTAINER */}
      <aside
        className={`print:hidden
        fixed top-0 left-0 z-50 h-full flex flex-col
        bg-card border-r border-outline transition-all duration-500
        /* Chiều rộng: 280px trên mobile, 64 (256px) trên desktop */
        w-[280px] sm:w-64 
        /* Logic ẩn/hiện */
        transform ${open ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
      >
        {/* CLOSE BUTTON MOBILE: Chỉ hiện trên mobile */}
        <div className="flex justify-between items-center p-4 lg:hidden">
          <h2 className="font-bold text-primary uppercase tracking-widest text-xs italic">Hệ thống</h2>
          <button 
            onClick={() => setOpen(false)} 
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-primary/10 text-on-surface"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* LOGO AREA */}
        <div className="flex items-center gap-3 mb-6 mt-2 px-6">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
            <span className="material-symbols-outlined text-card">coffee</span>
          </div>
          <div className="overflow-hidden">
            <h1 className="text-xl font-black text-on-surface tracking-tighter leading-none">Nắng PR</h1>
            <p className="text-[10px] uppercase text-primary font-bold tracking-widest mt-1">
              Coffee Atelier
            </p>
          </div>
        </div>

        {/* MENU NAVIGATION: Có thanh cuộn độc lập nếu danh sách quá dài */}
        <nav className="flex-1 space-y-1 px-4 overflow-y-auto overflow-x-hidden custom-scrollbar pr-2">
          {menu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 md:px-3 md:py-2.5 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-primary text-card shadow-md font-bold"
                    : "text-on-surface opacity-70 hover:bg-primary/10 hover:opacity-100"
                }`
              }
            >
              <span className="material-symbols-outlined text-[22px] shrink-0">{item.icon}</span>
              <span className="text-sm tracking-wide">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* FOOTER: Trợ giúp và Đăng xuất */}
        <div className="mt-auto p-4 border-t border-outline space-y-1">
          <button className="flex items-center gap-3 px-4 py-3 text-on-surface opacity-70 hover:opacity-100 hover:bg-primary/5 rounded-xl w-full transition-all">
            <span className="material-symbols-outlined text-[20px]">help</span>
            <span className="text-sm font-medium">Hỗ trợ</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl w-full transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span className="text-sm font-black uppercase tracking-widest">Đăng xuất</span>
          </button>
        </div>
      </aside>
    </>
  );
}