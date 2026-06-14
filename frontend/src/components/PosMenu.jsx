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
    if (cat !== "Tất cả") items = items.filter((m) => m.ten_danh_muc === cat);
    if (search.trim()) {
      const q = removeAccent(search.toLowerCase());
      items = items.filter((m) => removeAccent(m.ten_mon.toLowerCase()).includes(q));
    }
    return items;
  }, [menu, cat, search]);

  return (
    <div className="flex flex-col h-full min-h-[400px]">
      {/* Search Bar */}
      <div className="relative w-full mb-3 group">
        <input
          className="peer w-full bg-surface-container-low/70 border border-outline/20 rounded-2xl py-3 pl-4 pr-10 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all placeholder:text-muted/60"
          placeholder="Tìm kiếm..."
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-muted transition-opacity text-xl pointer-events-none peer-focus:opacity-0 peer-[:not(:placeholder-shown)]:opacity-0">
          search
        </span>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-1">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
              cat === c
                ? "bg-primary text-on-primary shadow-md shadow-primary/20 scale-105"
                : "bg-surface-container-high/60 text-on-surface-variant hover:bg-surface-container-high hover:text-primary border border-outline/10"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto flex-1 pb-4 custom-scrollbar pr-1">
        {list.map((mon) => {
          const img = dishImage(mon.hinh_anh);
          const locked = mon.het_hang;
          const stockText =
            Number(mon.so_luong_co_the_lam) > 5
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
              title={locked ? "Hết kho — tạm khóa" : mon.ten_mon}
              className="group bg-surface-container-lowest rounded-2xl border border-outline/15 hover:border-primary/30 hover:shadow-xl transition-all duration-300 p-3.5 text-left cursor-pointer active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {/* Image */}
              <div className="aspect-square overflow-hidden rounded-xl mb-3 bg-surface-container shadow-inner">
                {img ? (
                  <div className="w-full h-full relative">
                    <img
                      src={img}
                      alt={mon.ten_mon}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        e.target.style.display = "none";
                        const fallback = e.target.parentElement.querySelector(".fallback-icon");
                        if (fallback) fallback.classList.remove("hidden");
                      }}
                    />
                    <div className="fallback-icon hidden absolute inset-0 flex items-center justify-center bg-gradient-to-br from-surface-container to-surface-container-high text-3xl text-muted">
                      {mon.ten_danh_muc?.includes("Café") || mon.ten_danh_muc?.includes("Cafe")
                        ? "☕"
                        : "🍹"}
                    </div>
                    {locked && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-[2px]">
                        Hết hàng
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-container to-surface-container-high text-3xl text-muted">
                    {mon.ten_danh_muc?.includes("Café") || mon.ten_danh_muc?.includes("Cafe")
                      ? "☕"
                      : "🍹"}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="space-y-1">
                <h4 className="font-body font-bold text-on-surface text-sm leading-tight line-clamp-2 min-h-[2.5rem]">
                  {mon.ten_mon}
                </h4>
                <p className="font-price-display text-xl text-primary font-bold tracking-tight">
                  {fmtMoney(mon.gia_ban)}
                </p>
                <p
                  className={`text-[10px] font-medium mt-0.5 ${
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
