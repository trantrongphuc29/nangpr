const caLinhHoatRepository = require("../repositories/caLinhHoatRepository");
const nhanVienRepository = require("../repositories/nhanVienRepository");
const { normalizeTrangThai } = require("../utils/nhanVienStatus");

// Ca linh hoạt chỉ chọn theo giờ tròn (24h), không chọn phút
const TIME_RE = /^([01]\d|2[0-3]):00$/;

function validateTimeRange(gio_bat_dau, gio_ket_thuc) {
  if (!TIME_RE.test(gio_bat_dau) || !TIME_RE.test(gio_ket_thuc)) {
    throw { status: 400, message: "Giờ bắt đầu/kết thúc không hợp lệ (chọn theo giờ tròn, định dạng 24h)" };
  }
  if (gio_ket_thuc <= gio_bat_dau) {
    throw { status: 400, message: "Giờ kết thúc phải sau giờ bắt đầu" };
  }
}

/** Chỉ nhân viên đang làm mới được phân công (linh hoạt) từ hôm nay trở đi — cùng quy tắc với ca mặc định */
async function assertStaffAssignable(ma_nhan_vien, ngay) {
  const staffList = await nhanVienRepository.getAll();
  const staff = staffList.find((s) => String(s.ma_nhan_vien) === String(ma_nhan_vien));
  const status = normalizeTrangThai(staff?.trang_thai);
  const ngayStr = String(ngay).substring(0, 10);
  const d = new Date();
  const todayStr = new Date(d.getTime() + 7 * 3600000).toISOString().substring(0, 10);
  if (status !== "dang_lam" && ngayStr >= todayStr) {
    throw {
      status: 400,
      message: "Chỉ nhân viên đang làm mới được phân công từ hôm nay trở đi",
    };
  }
}

const getAssignments = async (queryOptions) => caLinhHoatRepository.getAssignments(queryOptions);

const createAssignment = async (payload) => {
  const { ma_nhan_vien, ngay, gio_bat_dau, gio_ket_thuc, ghi_chu } = payload;
  if (!ma_nhan_vien || !ngay || !gio_bat_dau || !gio_ket_thuc) {
    throw { status: 400, message: "Vui lòng chọn đủ nhân viên, ngày và khung giờ" };
  }
  validateTimeRange(gio_bat_dau, gio_ket_thuc);
  await assertStaffAssignable(ma_nhan_vien, ngay);
  return caLinhHoatRepository.createAssignment({ ma_nhan_vien, ngay, gio_bat_dau, gio_ket_thuc, ghi_chu });
};

const updateAssignment = async (id, payload) => {
  const existing = await caLinhHoatRepository.getById(id);
  if (!existing) {
    throw { status: 404, message: "Không tìm thấy phân công linh hoạt" };
  }
  const { ma_nhan_vien, ngay, gio_bat_dau, gio_ket_thuc, ghi_chu } = payload;
  if (!ma_nhan_vien || !ngay || !gio_bat_dau || !gio_ket_thuc) {
    throw { status: 400, message: "Vui lòng chọn đủ nhân viên, ngày và khung giờ" };
  }
  validateTimeRange(gio_bat_dau, gio_ket_thuc);
  await assertStaffAssignable(ma_nhan_vien, ngay);
  return caLinhHoatRepository.updateAssignment(id, { ma_nhan_vien, ngay, gio_bat_dau, gio_ket_thuc, ghi_chu });
};

const removeAssignment = async (id) => {
  const ok = await caLinhHoatRepository.removeAssignment(id);
  if (!ok) {
    throw { status: 404, message: "Không tìm thấy phân công linh hoạt" };
  }
  return ok;
};

module.exports = {
  getAssignments,
  createAssignment,
  updateAssignment,
  removeAssignment,
};
