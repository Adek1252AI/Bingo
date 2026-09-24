'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Button } from '@/interface/components/ui/button';

interface Props {
  open: boolean;
  onClose: () => void;
  lines?: number;
}

function fireConfetti() {
  confetti({
    particleCount: 150,
    spread: 70,
    startVelocity: 45,
    origin: { x: 0.5, y: 0.4 },
    // Monochrome palette: black, white, grey
    colors: ['#000000', '#ffffff', '#525252', '#a3a3a3'],
    disableForReducedMotion: true,
  });
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function WinCelebration({ open, onClose, lines }: Props) {
  const reduceMotion = useReducedMotion();
  const wasOpen = useRef(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open && !wasOpen.current) {
      fireConfetti();
      lastFocusedRef.current = document.activeElement as HTMLElement | null;
      requestAnimationFrame(() => {
        const first = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
        (first ?? dialogRef.current)?.focus();
      });
    }
    wasOpen.current = open;
  }, [open]);

  useEffect(() => {
    if (!open && lastFocusedRef.current) {
      lastFocusedRef.current.focus?.();
      lastFocusedRef.current = null;
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        const focusables = dialogRef.current
          ? Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
          : [];
        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey && (active === first || active === dialogRef.current)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            data-testid="win-backdrop"
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label="Bingo win"
              tabIndex={-1}
              className="w-full max-w-sm rounded-xl border-2 border-neutral-900 bg-white p-8 text-center shadow-xl outline-none"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 24 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 12 }}
              transition={
                reduceMotion
                  ? { duration: 0.15 }
                  : { type: 'spring', stiffness: 320, damping: 24 }
              }
            >
              <motion.h2
                className="font-display text-6xl tracking-wide text-neutral-900"
                initial={reduceMotion ? undefined : { scale: 0.6, opacity: 0 }}
                animate={reduceMotion ? undefined : { scale: 1, opacity: 1 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 380, damping: 14, delay: 0.12 }
                }
              >
                BINGO!
              </motion.h2>

              <p className="mt-3 text-text-secondary">
                {lines !== undefined && lines > 0
                  ? `${lines} winning line${lines === 1 ? '' : 's'} — great board!`
                  : 'You completed a line — great board!'}
              </p>

              <Button
                variant="default"
                size="lg"
                className="mt-6 bg-neutral-900 text-white hover:bg-neutral-800"
                onClick={onClose}
              >
                Play again
              </Button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
