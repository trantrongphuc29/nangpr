/* =====  PriceInput =====
 * Input field tự động thêm dấu chấm phân cách hàng nghìn
 * Khi nhập "3333333" → hiển thị "3.333.333"
 * onChange trả về giá trị số nguyên (Number), không có dấu chấm
 * ============================== */
import React from "react";

const PriceInput = React.forwardRef(function PriceInput(
  { value, onChange, className = "", ...props },
  ref
) {
  const handleChange = (e) => {
    // Chỉ giữ lại chữ số
    const raw = e.target.value.replace(/[^0-9]/g, "");
    // Gọi onChange với Number (hoặc '' nếu rỗng)
    onChange(raw === "" ? "" : Number(raw));
  };

  // Format hiển thị: thêm dấu chấm
  const displayValue =
    value === "" || value === null || value === undefined
      ? ""
      : Number(value).toLocaleString("vi-VN");

  return (
    <div className="relative">
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        className={`${className}`}
        {...props}
      />
    </div>
  );
});

export default PriceInput;
