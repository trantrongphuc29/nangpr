import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { registerPdfFonts, PDF_FONT } from "./pdfFonts";
import { getPdfTheme } from "./pdfTheme";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function moneyNum(n) {
  return Math.round(Number(n) || 0);
}

function moneyText(n) {
  return moneyNum(n).toLocaleString("vi-VN");
}

function hoursText(n) {
  return Number(n || 0).toLocaleString("vi-VN", { maximumFractionDigits: 2 });
}

const SALARY_HEADERS = [
  "Nhân viên",
  "Tổng ca",
  "Tổng giờ",
  "Lương/giờ",
  "Lương cơ bản",
  "Phụ cấp",
  "Thưởng",
  "Khấu trừ",
  "Tạm ứng",
  "Lương thực nhận",
];

function rowToExportCells(r) {
  return [
    r.ten || "",
    moneyNum(r.tong_ca),
    Number(r.tong_gio) || 0,
    moneyNum(r.luong_gio),
    moneyNum(r.luong_co_ban),
    moneyNum(r.phu_cap),
    moneyNum(r.thuong),
    moneyNum(r.khau_tru),
    moneyNum(r.tam_ung),
    moneyNum(r.luong_thuc_nhan),
  ];
}

function totalsToExportCells(totals) {
  return [
    "TỔNG CỘNG",
    "",
    Number(totals?.tong_gio) || 0,
    "",
    moneyNum(totals?.tong_luong_co_ban),
    moneyNum(totals?.tong_phu_cap),
    moneyNum(totals?.tong_thuong),
    moneyNum(totals?.tong_khau_tru),
    moneyNum(totals?.tong_tam_ung),
    moneyNum(totals?.tong_tien_phai_tra),
  ];
}

function formatRowForDisplay(cells) {
  return cells.map((cell, i) => {
    if (i === 0) return String(cell);
    if (i === 1) return String(cell);
    if (i === 2) return hoursText(cell);
    if (cell === "") return "";
    return moneyText(cell);
  });
}

export function exportBangLuongExcel({ rows, totals, thang, nam, kyLabel }) {
  if (!rows?.length) {
    throw new Error("Không có dữ liệu để xuất");
  }

  const sheetData = [
    [`BẢNG LƯƠNG THÁNG ${pad2(thang)}/${nam}`],
    [`Trạng thái kỳ: ${kyLabel}`],
    [`Số nhân viên: ${rows.length}`],
    [],
    SALARY_HEADERS,
    ...rows.map(rowToExportCells),
    [],
    totalsToExportCells(totals),
  ];

  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  ws["!cols"] = [
    { wch: 28 },
    { wch: 10 },
    { wch: 10 },
    { wch: 14 },
    { wch: 16 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 18 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Bảng lương");
  XLSX.writeFile(wb, `bang_luong_${nam}-${pad2(thang)}.xlsx`);
}

export function exportPhieuNhapExcel({ rows, tuNgay, denNgay }) {
  if (!rows?.length) {
    throw new Error("Không có dữ liệu để xuất");
  }

  const HEADERS = [
    "Mã phiếu",
    "Ngày nhập",
    "Nhà cung cấp",
    "Tổng tiền",
    "Đã thanh toán",
    "Còn nợ",
    "Trạng thái",
  ];

  function rowToCells(r) {
    const conNo = Number(r.con_no || 0);
    const isPaid = conNo <= 0;
    return [
      String(r.ma_phieu || ""),
      r.ngay_nhap ? new Date(r.ngay_nhap).toLocaleDateString("vi-VN") : "",
      r.nha_cung_cap || "",
      Math.round(Number(r.tong_tien) || 0),
      Math.round(Number(r.so_tien_da_tra) || 0),
      Math.round(conNo),
      isPaid ? "Đã thanh toán" : "Chưa thanh toán",
    ];
  }

  const sheetData = [
    ["DANH SÁCH PHIẾU NHẬP"],
    tuNgay && denNgay ? [`Từ ${tuNgay} đến ${denNgay}`] : [],
    [`Số phiếu: ${rows.length}`],
    [],
    HEADERS,
    ...rows.map(rowToCells),
  ];

  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  ws["!cols"] = [
    { wch: 12 },
    { wch: 16 },
    { wch: 28 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 18 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Phiếu nhập");
  XLSX.writeFile(wb, `danh_sach_phieu_nhap_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export async function exportBangLuongPDF({ rows, totals, thang, nam, kyLabel }) {
  if (!rows?.length) {
    throw new Error("Không có dữ liệu để xuất");
  }

  const theme = getPdfTheme();
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  await registerPdfFonts(doc);

  const pageW = doc.internal.pageSize.getWidth();

  doc.setFont(PDF_FONT, "bold");
  doc.setFontSize(15);
  doc.setTextColor(...theme.primary);
  doc.text(`BẢNG LƯƠNG THÁNG ${pad2(thang)}/${nam}`, pageW / 2, 14, { align: "center" });

  doc.setFont(PDF_FONT, "normal");
  doc.setFontSize(10);
  doc.setTextColor(...theme.muted);
  doc.text(`Trạng thái kỳ: ${kyLabel}`, 14, 22);

  doc.setTextColor(...theme.text);
  doc.setFont(PDF_FONT, "bold");
  doc.text(`Tổng tiền phải trả: ${moneyText(totals?.tong_tien_phai_tra)} đ`, 14, 28);
  doc.setFont(PDF_FONT, "normal");

  const body = rows.map((r) => formatRowForDisplay(rowToExportCells(r)));
  const foot = [formatRowForDisplay(totalsToExportCells(totals))];

  autoTable(doc, {
    startY: 34,
    head: [SALARY_HEADERS],
    body,
    foot,
    theme: "grid",
    styles: {
      font: PDF_FONT,
      fontSize: 8,
      cellPadding: 2.5,
      overflow: "linebreak",
      textColor: theme.text,
      lineColor: theme.border,
      lineWidth: 0.15,
      fillColor: theme.surface,
    },
    headStyles: {
      font: PDF_FONT,
      fillColor: theme.primary,
      textColor: theme.onPrimary,
      fontStyle: "bold",
      halign: "center",
      valign: "middle",
      minCellHeight: 8,
      overflow: "visible",
    },
    footStyles: {
      font: PDF_FONT,
      fillColor: theme.primaryContainer,
      textColor: theme.text,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: theme.mainBg,
    },
    columnStyles: {
      0: { halign: "left", cellWidth: 40 },
      1: { halign: "center", cellWidth: 20 },
      2: { halign: "right", cellWidth: 16 },
      3: { halign: "right", cellWidth: 21 },
      4: { halign: "right", cellWidth: 25 },
      5: { halign: "right", cellWidth: 21 },
      6: { halign: "right", cellWidth: 21 },
      7: { halign: "right", cellWidth: 21 },
      8: { halign: "right", cellWidth: 21 },
      9: { halign: "right", cellWidth: 27, fontStyle: "bold" },
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      const pageCount = doc.getNumberOfPages();
      doc.setFont(PDF_FONT, "normal");
      doc.setFontSize(8);
      doc.setTextColor(...theme.muted);
      doc.text(
        `Trang ${data.pageNumber} / ${pageCount}`,
        pageW - 14,
        doc.internal.pageSize.getHeight() - 8,
        { align: "right" }
      );
    },
  });

  doc.save(`bang_luong_${nam}-${pad2(thang)}.pdf`);
}
