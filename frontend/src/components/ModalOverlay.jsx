import useScrollLock from './useScrollLock';

/**
 * Lớp nền mờ của modal. Thay cho <div className="modal-overlay">,
 * kèm sẵn khoá cuộn trang nền khi modal mở.
 */
export default function ModalOverlay({ className = '', children, ...props }) {
  useScrollLock();
  return (
    <div className={`modal-overlay ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}
