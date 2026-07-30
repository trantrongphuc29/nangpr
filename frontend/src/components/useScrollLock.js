import { useLayoutEffect } from 'react';

/**
 * Khoá cuộn trang nền khi modal/overlay đang mở.
 *
 * Dùng bộ đếm chung nên nhiều modal mở chồng nhau vẫn đúng: chỉ mở khoá khi
 * modal cuối cùng đóng. Bù thêm phần chiều rộng thanh cuộn để trang không bị
 * "giật" ngang lúc thanh cuộn biến mất.
 *
 * Việc khoá nằm ở class `body.scroll-locked` (chỉ áp dụng @media screen) để
 * không ảnh hưởng các chức năng in hoá đơn / in phiếu.
 */
let soModalDangMo = 0;

export default function useScrollLock(locked = true) {
  useLayoutEffect(() => {
    if (!locked) return undefined;

    if (soModalDangMo === 0) {
      const beRongThanhCuon = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.setProperty('--scrollbar-gap', `${Math.max(beRongThanhCuon, 0)}px`);
      document.body.classList.add('scroll-locked');
    }
    soModalDangMo += 1;

    return () => {
      soModalDangMo -= 1;
      if (soModalDangMo === 0) {
        document.body.classList.remove('scroll-locked');
        document.body.style.removeProperty('--scrollbar-gap');
      }
    };
  }, [locked]);
}
