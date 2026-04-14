import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000";

export default function Ban() {
  const [list, setList] = useState([]);
  const [tenBan, setTenBan] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/ban?sort=asc`);
      setList(res.data);
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
      await axios.post(`${API_URL}/api/ban`, { ten_ban: ten });
      setTenBan("");
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi");
    }
  };

  const deleteBan = async (id) => {
    if (!window.confirm("Xóa bàn này?")) return;
    await axios.delete(`${API_URL}/api/ban/${id}`);
    loadData();
  };

  const updateBan = async () => {
    const ten = tenBan.trim();
    if (!ten) return alert("Nhập tên bàn!");

    try {
      await axios.put(`${API_URL}/api/ban/${editId}`, { ten_ban: ten });
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
    <div className="min-h-screen bg-gradient-to-br from-[#fdf6f0] to-[#f3e7db] p-8">
      
      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-[#553722] mb-2">
          ☕ Quản lý bàn
        </h1>
        
      </div>

      {/* FORM */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-10 flex flex-wrap gap-4 items-center">
        <input
          value={tenBan}
          onChange={(e) => setTenBan(e.target.value)}
          placeholder="Nhập tên bàn ..."
          className="flex-1 min-w-[250px] border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#553722]"
        />

        {editId ? (
          <button
            onClick={updateBan}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all shadow-md hover:scale-105"
          >
            Cập nhật
          </button>
        ) : (
          <button
            onClick={addBan}
            className="bg-[#553722] hover:bg-[#3f2a19] text-white px-6 py-3 rounded-xl transition-all shadow-md hover:scale-105"
          >
            Thêm bàn
          </button>
        )}
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="flex justify-center mt-20">
          <div className="w-12 h-12 border-4 border-[#553722] border-dashed rounded-full animate-spin"></div>
        </div>
      ) : list.length === 0 ? (
        // EMPTY STATE
        <div className="text-center mt-20 text-gray-500">
          <p className="text-xl">😢 Chưa có bàn nào</p>
          <p>Hãy thêm bàn đầu tiên của bạn!</p>
        </div>
      ) : (
        // LIST
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {list.map((ban) => (
            <div
              key={ban.ma_ban}
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                {ban.ten_ban}
              </h2>

              <div className="flex gap-3">
                <button
                  onClick={() => handleEdit(ban)}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg text-sm font-medium transition"
                >
                  ✏️ Sửa
                </button>

                <button
                  onClick={() => deleteBan(ban.ma_ban)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-medium transition"
                >
                  🗑️ Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}