import { useEffect, useMemo, useState } from "react";
import { createBan, deleteBanById, getBanList, updateBanById } from "../services/banService";

const removeVietnameseTones = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();
};

export default function Ban() {
  const [list, setList] = useState([]);
  const [tenBan, setTenBan] = useState("");
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
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

  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return list;
    const q = removeVietnameseTones(searchTerm);
    return list.filter((b) => removeVietnameseTones(b.ten_ban || '').includes(q));
  }, [list, searchTerm]);

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
    <div className="space-y-4 text-on-surface pb-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "color-mix(in srgb, var(--color-primary) 10%, transparent)" }}>
            <span className="material-symbols-outlined" style={{ color: "var(--color-primary)" }}>table_restaurant</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-primary)" }}>Quản Lý Bàn</h2>
            <p className="text-xs text-muted">Quản lý danh sách bàn phục vụ tại quán</p>
          </div>
        </div>
      </div>

      {/* FORM: Ô nhập và nút thêm */}
      <div className="card p-4 md:p-5 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center border-none">
        <input
          value={tenBan}
          onChange={(e) => setTenBan(e.target.value)}
          placeholder="Nhập tên bàn (ví dụ: Bàn 01)..."
          className="input-field flex-1 min-w-0"
        />

        {editId ? (
          <button onClick={updateBan} className="btn-secondary shrink-0 uppercase">
            <span className="material-symbols-outlined">check</span>
            Cập Nhật
          </button>
        ) : (
          <button onClick={addBan} className="btn-primary shrink-0 uppercase">
            <span className="material-symbols-outlined">add</span>
            Thêm Bàn
          </button>
        )}
      </div>

      {/* SEARCH */}
      <div className="relative">
        <input
          type="text"
          placeholder="Tìm kiếm bàn..."
          className="peer input-field !pr-10 !py-2.5"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-muted text-xl pointer-events-none peer-focus:opacity-0 peer-[:not(:placeholder-shown)]:opacity-0 transition-opacity">
          search
        </span>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-primary border-dashed rounded-full animate-spin" />
        </div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-muted">
          <span className="material-symbols-outlined text-5xl text-muted/40 block mb-3">table_restaurant</span>
          <p className="font-medium uppercase">Chưa Có Dữ Liệu Bàn</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredList.length === 0 ? (
            <div className="col-span-full flex flex-col items-center py-16 text-muted">
              <span className="material-symbols-outlined text-4xl mb-2">search_off</span>
              <p className="font-medium uppercase">Không Tìm Thấy Bàn</p>
            </div>
          ) : (
            filteredList.map((ban) => (
              <div
                key={ban.ma_ban}
                className="card p-5 hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 border-none"
              >
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold text-on-surface uppercase">
                    {ban.ten_ban}
                  </h2>
                  <span className="material-symbols-outlined text-2xl text-muted/20">table_restaurant</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(ban)}
                    className="flex-1 btn-outline !py-2 !text-xs"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    SỬA
                  </button>
                  <button
                    onClick={() => deleteBan(ban.ma_ban)}
                    className="flex-1 btn-outline !py-2 !text-xs !border-error/40 !text-error hover:!bg-error/10 hover:!border-error uppercase"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                    XÓA
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}