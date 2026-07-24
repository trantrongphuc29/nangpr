import { useMemo, useState } from "react";
import { dishImage } from "../utils/shared";

const fmtMoney = (n) => Number(n || 0).toLocaleString("vi-VN") + "đ";

export default function PosMenu({ menu, busy, onAdd }) {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("Tất cả");

  const categories = useMemo(() => {
    const c = [...new Set(menu.map((m) => m.ten_danh_muc).filter(Boolean))];
    return ["Tất cả", ...c];
  }, [menu]);

  const list = useMemo(() => {
    let items = [...menu];
    items = items.filter((m) => Number(m.so_luong_nguyen_lieu) > 0);
    // Sắp xếp theo tên A-Z
    items.sort((a, b) => a.ten_mon.localeCompare(b.ten_mon, 'vi'));
    if (cat !== "Tất cả") items = items.filter((m) => m.ten_danh_muc === cat);
    if (search.trim()) {
      const q = removeAccent(search.toLowerCase());
      items = items.filter((m) => 
        removeAccent(m.ten_mon.toLowerCase()).includes(q) ||
        String(m.ma_mon).includes(q) ||
        String(m.gia_ban || '').includes(q) ||
        removeAccent((m.ten_danh_muc || '').toLowerCase()).includes(q)
      );
    }
    return items;
  }, [menu, cat, search]);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Search Bar */}
      <div className="relative w-full mb-3 group shrink-0">
        <input
          className="peer w-full bg-surface-container-low/70 border border-outline/20 rounded-2xl py-3 pl-4 pr-10 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all placeholder:text-muted/60"
          placeholder="Tìm kiếm..."
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
       <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--color-primary)" }}>search</span>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-1 shrink-0">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors duration-150 ${
              cat === c
                ? "bg-primary text-on-primary"
                : "bg-surface-container-high/60 text-on-surface-variant hover:bg-surface-container-high hover:text-primary border border-outline/10"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 overflow-y-auto flex-1 pb-4 custom-scrollbar pr-1">
        {list.map((mon) => {
          const img = dishImage(mon.hinh_anh);
          const locked = mon.bi_khoa ?? mon.het_hang;
          const hetHan = mon.het_han;
          const stockText =
            hetHan
              ? "Nguyên liệu hết hạn"
              : Number(mon.so_luong_co_the_lam) > 5
              ? `Còn: ${mon.so_luong_co_the_lam} phần`
              : Number(mon.so_luong_co_the_lam) > 0
              ? `Sắp hết: ${mon.so_luong_co_the_lam} phần`
              : "Hết hàng";

          return (
            <button
              key={mon.ma_mon}
              type="button"
              disabled={busy || locked}
              onClick={() => onAdd(mon)}
              title={locked ? (hetHan ? "Nguyên liệu hết hạn — tạm khóa" : "Hết kho — tạm khóa") : mon.ten_mon}
              className="group bg-surface-container-lowest rounded-2xl border border-outline/15 hover:border-primary/40 hover:shadow-md transition-all duration-150 p-2.5 text-left cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {/* Image */}
              <div className="aspect-square overflow-hidden rounded-xl mb-2 bg-surface-container">
                {img ? (
                  <div className="w-full h-full relative">
                    <img
                      src={img}
                      alt={mon.ten_mon}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.target.style.display = "none";
                        const fallback = e.target.parentElement.querySelector(".fallback-icon");
                        if (fallback) fallback.classList.remove("hidden");
                      }}
                    />
                    <div className="fallback-icon hidden absolute inset-0 flex items-center justify-center bg-gradient-to-br from-surface-container to-surface-container-high text-3xl text-muted">
                      {mon.ten_danh_muc?.includes("Café") || mon.ten_danh_muc?.includes("Cafe")
                        ? <span className="material-symbols-outlined text-3xl">coffee</span>
                        : <span className="material-symbols-outlined text-3xl">local_bar</span>}
                    </div>
                    {locked && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-[2px]">
                        {hetHan ? "Hết hạn" : "Hết hàng"}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-container to-surface-container-high text-3xl text-muted">
                    {mon.ten_danh_muc?.includes("Café") || mon.ten_danh_muc?.includes("Cafe")
                      ? <span className="material-symbols-outlined text-3xl">coffee</span>
                      : <span className="material-symbols-outlined text-3xl">local_bar</span>}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="space-y-0.5">
                <h4 className="font-semibold text-on-surface text-sm leading-snug line-clamp-2 min-h-[2.25rem]">
                  {mon.ten_mon}
                </h4>
                <p className="text-base text-primary font-bold tracking-tight">
                  {fmtMoney(mon.gia_ban)}
                </p>
                <p
                  className={`text-[11px] font-semibold ${
                    Number(mon.so_luong_co_the_lam) <= 5
                      ? "text-error"
                      : "text-muted"
                  }`}
                >
                  {stockText}
                </p>
              </div>
            </button>
          );
        })}
        {!list.length && (
          <p className="col-span-full text-center text-muted text-sm py-12 font-medium">
            Không có món khả dụng
          </p>
        )}
      </div>
    </div>
  );
}

/* ───── Helper ───── */
function removeAccent(str) {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}
