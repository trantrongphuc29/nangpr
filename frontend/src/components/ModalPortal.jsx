import { createPortal } from 'react-dom';

/**
 * Renders children on document.body so fixed overlays sit above the sticky header.
 * (Modals inside <main> otherwise stay below header z-40 stacking context.)
 */
export default function ModalPortal({ children }) {
  if (typeof document === 'undefined') return null;
  return createPortal(children, document.body);
}
