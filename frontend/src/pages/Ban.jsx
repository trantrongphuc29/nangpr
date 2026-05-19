import { useEffect, useState } from "react";
import { createBan, deleteBanById, getBanList, updateBanById } from "../services/banService";

export default function Ban() {
  const [list, setList] = useState([]);
  const [tenBan, setTenBan] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getBanList("asc");
      setList(data);
    } catch (err) {
      alert("Không load được dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addBan = async () => {
    const ten = tenBan.trim();
    if (!ten) return alert("Nhập tên bàn!");

    if (list.some(b => b.ten_ban.toLowerCase() === ten.toLowerCase())) {
      return alert("Tên bàn đã tồn tại!");
    }

    try {
      await createBan({ ten_ban: ten });
      setTenBan("");
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi");
    }
  };

  const deleteBan = async (id) => {
    if (!window.confirm("Xóa bàn này?")) return;
    await deleteBanById(id);
    loadData();
  };

  const updateBan = async () => {
    const ten = tenBan.trim();
    if (!ten) return alert("Nhập tên bàn!");

    try {
      await updateBanById(editId, { ten_ban: ten });
      setEditId(null);
      setTenBan("");
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi");
    }
  };

  const handleEdit = (ban) => {
    setEditId(ban.ma_ban);
    setTenBan(ban.ten_ban);
  };

  return (
    <div className="min-h-screen bg-surface-container-low p-4 md:p-8 transition-colors duration-500">
      
      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-black text-primary mb-2 uppercase tracking-tighter italic">
          ☕ Quản lý bàn
        </h1>
      </div>

      {/* FORM: Ô nhập và nút thêm */}
      <div className="card p-4 md:p-6 mb-10 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center border-none shadow-lg">
        <input
          value={tenBan}
          onChange={(e) => setTenBan(e.target.value)}
          placeholder="Nhập tên bàn (ví dụ: Bàn 01)..."
          className="flex-1 min-w-0"
        />

        {editId ? (
          <button
            onClick={updateBan}
            className="btn-primary !bg-blue-600 hover:!bg-blue-700 !shadow-blue-500/20"
          >
            <span className="material-symbols-outlined">check</span>
            Cập nhật
          </button>
        ) : (
          <button
            onClick={addBan}
            className="btn-primary"
          >
            <span className="material-symbols-outlined">add</span>
            Thêm bàn mới
          </button>
        )}
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="flex justify-center mt-20">
          <div className="w-12 h-12 border-4 border-primary border-dashed rounded-full animate-spin"></div>
        </div>
      ) : list.length === 0 ? (
        <div className="text-center mt-20 text-on-surface opacity-50 uppercase font-bold tracking-widest">
          <p className="text-xl">😢 Chưa có dữ liệu bàn</p>
          <p className="text-xs mt-2 font-medium uppercase opacity-60">Hãy bắt đầu thêm bàn đầu tiên của bạn</p>
        </div>
      ) : (
        // LIST
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {list.map((ban) => (
            <div
              key={ban.ma_ban}
              className="card p-6 hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 border-none relative overflow-hidden group"
            >
              {/* Trang trí nhẹ cho Card bàn */}
              <div className="absolute top-0 right-0 p-2 opacity-5">
                <span className="material-symbols-outlined text-6xl">table_restaurant</span>
              </div>

              <h2 className="text-2xl font-black text-on-surface mb-6 uppercase italic relative z-10">
                {ban.ten_ban}
              </h2>

              <div className="flex gap-2 relative z-10">
                {/* Nút Sửa: Dùng màu Amber (vàng cam) nhạt để thanh lịch */}
                <button
                  onClick={() => handleEdit(ban)}
                  className="flex-1 flex items-center justify-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all hover:bg-amber-500 hover:text-white active:scale-90"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                  Sửa
                </button>

                {/* Nút Xóa: Dùng btn-error từ index.css */}
                <button
                  onClick={() => deleteBan(ban.ma_ban)}
                  className="flex-1 flex items-center justify-center gap-1 btn-error !text-[10px] !py-2.5"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}