import { useEffect, useState } from "react";

export default function Header({ setOpen }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  return (
    // Đã thêm print:hidden ở đây
    <header className="print:hidden sticky top-0 z-40 bg-surface-container-low shadow-sm flex justify-between items-center px-6 py-3">
      
      {/* LEFT */}
      <div className="flex items-center gap-3">
        
        {/* MOBILE MENU BUTTON */}
        <button
          onClick={() => setOpen(true)}
          className="lg:hidden p-2 rounded-md hover:bg-gray-200"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        {/* SEARCH */}
        <div className="relative hidden sm:block">
          <span className="absolute left-3 top-2.5 text-gray-400 material-symbols-outlined">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="pl-10 pr-4 py-2 bg-white rounded-lg border text-sm focus:outline-none"
          />
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-gray-100">
          <span className="material-symbols-outlined">notifications</span>
        </button>

        <button className="p-2 rounded-full hover:bg-gray-100">
          <span className="material-symbols-outlined">settings</span>
        </button>

        <div className="flex items-center gap-3 ml-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-[#553722]">
              {user?.username || "Admin"}
            </p>
          </div>

          <img
            src="https://i.pravatar.cc/40"
            className="w-9 h-9 rounded-full border"
            alt="avatar"
          />
        </div>
      </div>
    </header>
  );
}