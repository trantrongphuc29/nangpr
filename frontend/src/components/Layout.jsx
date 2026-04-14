import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";

export default function Layout() {
  const [open, setOpen] = useState(false);

  return (
    // Đã thêm print:bg-white để trang giấy in ra trắng tinh thay vì có nền xám
    <div className="flex min-h-screen bg-[#f5f5f0] print:bg-white">

      {/* Sidebar */}
      <Sidebar open={open} setOpen={setOpen} />

      {/* Main */}
      {/* Đã thêm print:ml-0 print:block để nội dung khi in được đẩy full ra mép giấy */}
      <div className="flex-1 flex flex-col lg:ml-64 print:ml-0 print:block">
        <Header setOpen={setOpen} />

        {/* Đã thêm print:p-0 để khi in xóa khoảng trắng thừa xung quanh */}
        <main className="p-6 print:p-0 print:m-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}