export default function Dashboard() {
  return (
    <div className="transition-colors duration-500">
      {/* Thay text-[#553722] bằng text-primary: 
          Sáng sẽ là Nâu, Tối sẽ là Cam Neon rực rỡ 
      */}
      <h1 className="text-3xl font-black text-primary uppercase tracking-tighter italic">
        Dashboard
      </h1>

      {/* Thay text-gray-600 bằng text-on-surface kết hợp opacity:
          Đảm bảo chữ luôn đọc được trên cả nền trắng và nền nâu đen
      */}
      <p className="text-on-surface opacity-70 mt-2 font-medium">
        Chào mừng bạn trở lại hệ thống quản lý Nắng PR.
      </p>

      {/* Ví dụ thêm một thẻ Card để tận dụng màu tổng */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card p-6 border-none shadow-lg">
          <p className="text-[10px] font-black uppercase text-on-surface opacity-50 tracking-widest">
            Trạng thái hệ thống
          </p>
          <p className="text-primary font-black text-xl mt-1">
            ĐANG HOẠT ĐỘNG
          </p>
        </div>
      </div>
    </div>
  );
}