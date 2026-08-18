/** Màu PDF luôn dùng bảng màu sáng: bản in / xuất file luôn nền trắng để in ra
 *  giấy rõ ràng, không đổi theo chế độ sáng-tối của trình duyệt. */
export function getPdfTheme() {
  return {
    primary: [47, 93, 80],
    onPrimary: [255, 255, 255],
    primaryContainer: [232, 239, 233],
    text: [31, 41, 55],
    muted: [107, 114, 128],
    border: [229, 231, 235],
    surface: [255, 255, 255],
    mainBg: [247, 243, 232],
  };
}
