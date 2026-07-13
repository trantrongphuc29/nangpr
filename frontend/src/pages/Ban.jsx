import { useEffect, useMemo, useState } from "react";
import { createBan, deleteBanById, getBanList, updateBanById } from "../services/banService";

const removeVietnameseTones = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
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

  // Sắp xếp tăng dần theo tên bàn — dùng so sánh tự nhiên (numeric) để "Bàn 2" đứng trước "Bàn 10"
  const sortedList = useMemo(() => {
    return [...list].sort((a, b) =>
      (a.ten_ban || '').localeCompare(b.ten_ban || '', 'vi', { numeric: true, sensitivity: 'base' })
    );
  }, [list]);

  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return sortedList;
    const q = removeVietnameseTones(searchTerm);
    return sortedList.filter((b) => removeVietnameseTones(b.ten_ban || '').includes(q));
  }, [sortedList, searchTerm]);

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
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Quản lý bàn</h2>
          <p className="text-sm text-muted">Danh sách bàn phục vụ tại quán</p>
        </div>
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <input
          value={tenBan}
          onChange={(e) => setTenBan(e.target.value)}
          placeholder="Nhập tên bàn (VD: Bàn 01)..."
          className="input-field flex-1 min-w-0"
        />

        {editId ? (
          <button onClick={updateBan} className="btn-secondary shrink-0">
            <span className="material-symbols-outlined text-lg">check</span>
            Cập nhật
          </button>
        ) : (
          <button onClick={addBan} className="btn-primary shrink-0">
            <span className="material-symbols-outlined text-lg">add</span>
            Thêm bàn
          </button>
        )}
      </div>

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

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-3 border-primary border-dashed rounded-full animate-spin" />
        </div>
      ) : list.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-muted">
          <span className="material-symbols-outlined text-4xl text-muted/30 mb-2">table_restaurant</span>
          <p className="text-sm">Chưa có bàn nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredList.length === 0 ? (
            <div className="col-span-full flex flex-col items-center py-16 text-muted">
              <span className="material-symbols-outlined text-3xl mb-2">search_off</span>
              <p className="text-sm">Không tìm thấy bàn</p>
            </div>
          ) : (
            filteredList.map((ban) => (
              <div key={ban.ma_ban} className="card p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-on-surface">
                    {ban.ten_ban}
                  </h2>
                  <span className="material-symbols-outlined text-xl text-muted/20">table_restaurant</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(ban)}
                    className="flex-1 btn-outline !py-1.5 !text-xs"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    Sửa
                  </button>
                  <button
                    onClick={() => deleteBan(ban.ma_ban)}
                    className="flex-1 btn-outline !py-1.5 !text-xs !border-error/30 !text-error hover:!bg-error/5"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                    Xóa
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
