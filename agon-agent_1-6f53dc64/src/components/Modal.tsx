import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';

type Props = { open: boolean; onClose: () => void; children: ReactNode; wide?: boolean; title?: ReactNode };

export default function Modal({ open, onClose, children, wide, title }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-forest-deep/60 backdrop-blur-sm sm:items-center sm:p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className={`scrollbar-thin relative max-h-[94vh] w-full overflow-y-auto rounded-t-[2rem] bg-cream shadow-2xl sm:rounded-[2rem] ${wide ? 'sm:max-w-5xl' : 'sm:max-w-lg'}`}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-forest/10 bg-cream/95 px-6 py-4 backdrop-blur">
              <div className="min-w-0 flex-1">{title}</div>
              <button onClick={onClose} aria-label="Close" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-forest/5 text-forest hover:bg-forest hover:text-cream">
                <X className="h-4 w-4" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
