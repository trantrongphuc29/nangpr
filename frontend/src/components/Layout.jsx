import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";

export default function Layout() {
  const [open, setOpen] = useState(false);

  return (
    // 1. Thay bg-[#f5f5f0] bằng bg-surface-container-low để đồng bộ Sáng/Tối
    // 2. Thêm transition-colors duration-500 để nền đổi màu mượt mà
    <div className="flex min-h-screen bg-surface-container-low transition-colors duration-500 print:bg-white font-sans">

      {/* Sidebar */}
      <Sidebar open={open} setOpen={setOpen} />

      {/* Main */}
      {/* Giữ nguyên logic responsive ml-64 và các class print của bạn */}
      <div className="flex-1 flex flex-col lg:ml-64 print:ml-0 print:block min-w-0 w-full">
        <Header setOpen={setOpen} />

        {/* Main content: p-6 giữ nguyên giao diện. 
            Mọi trang con (Outlet) bây giờ sẽ hiển thị trên nền tổng đã được đồng bộ.
        */}
        <main className="p-4 md:p-6 print:p-0 print:m-0 flex-1 min-h-0 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}