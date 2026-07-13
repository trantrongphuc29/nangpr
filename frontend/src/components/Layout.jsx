import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";

export default function Layout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface-container-low transition-colors duration-150 print:bg-white font-sans">
      <Sidebar open={open} setOpen={setOpen} />

      <div className="flex-1 flex flex-col lg:ml-[260px] print:ml-0 print:block min-w-0 w-full">
        <Header setOpen={setOpen} />
        <main className="p-4 md:p-6 print:p-0 print:m-0 flex-1 min-h-0 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
