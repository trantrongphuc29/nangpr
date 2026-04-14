import { NavLink, useNavigate } from "react-router-dom";

export default function Sidebar({ open, setOpen }) {
  const navigate = useNavigate();

  const menu = [
    { name: "Dashboard", path: "/", icon: "dashboard" },
    { name: "Bán hàng", path: "/pos", icon: "point_of_sale" },
    { name: "Nhân viên", path: "/nhanvien", icon: "badge" },
    { name: "Món", path: "/menu", icon: "restaurant_menu" },
    { name: "Nguyên liệu", path: "/nguyen-lieu", icon: "inventory_2" },
    { name: "Công thức", path: "/cong-thuc", icon: "menu_book" },
    { name: "Quản lý Bàn", path: "/ban", icon: "table_restaurant" },
    { name: "Doanh thu", path: "/doanhthu", icon: "payments" },
  ];

  const handleLogout = async () => {
    await fetch("http://localhost:3000/api/logout", { method: "POST" });
    localStorage.clear();
    navigate("/login");
  };

  return (
    <>
      {/* OVERLAY MOBILE */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          // Đã thêm print:hidden
          className="print:hidden fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`print:hidden
        fixed top-0 left-0 z-50 h-full w-64 bg-[#f4f4ef] p-4 flex flex-col
        transform transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
      >
        {/* CLOSE BUTTON MOBILE */}
        <div className="flex justify-between items-center mb-6 lg:hidden">
          <h2 className="font-bold text-[#553722]">Menu</h2>
          <button onClick={() => setOpen(false)}>
            ✖
          </button>
        </div>

        {/* LOGO */}
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#553722] to-[#6f4e37] flex items-center justify-center">
            <span className="material-symbols-outlined text-white">coffee</span>
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-[#553722]">Nắng PR</h1>
            <p className="text-[10px] uppercase text-[#50453e]">
              Coffee Atelier
            </p>
          </div>
        </div>

        {/* MENU */}
        <nav className="flex-1 space-y-1">
          {menu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                  isActive
                    ? "bg-white text-[#553722] shadow-sm font-semibold"
                    : "text-[#50453e] hover:bg-[#e8e8e3]"
                }`
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* FOOTER */}
        <div className="mt-auto pt-4 border-t space-y-1">
          <button className="flex items-center gap-3 px-3 py-2 hover:bg-gray-200 rounded-lg w-full">
            <span className="material-symbols-outlined">help</span>
            Help
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg w-full"
          >
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}