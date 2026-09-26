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
    particleCount: 120,
    spread: 70,
    startVelocity: 35,
    origin: { x: 0.5, y: 0.4 },
    // Soft pastel palette — pulled from the pastel token sheet accent family
    // paired with a soft mint and a warm pearl — never full saturation.
    colors: [
      '#7BAFD4', // soft sky blue  — --accent primary
      '#A8D5C0', // soft mint      — --accent-secondary
      '#F0D9A0', // warm pearl      — complementary soft neutral
      '#E8C4D8', // dusty rose      — warm pastel accent
      '#C9D4E8', // pale slate      — cool neutral
    ],
    // Softer shapes: a mix of classic rectangles and rounded circles,
    // with a fall-back to circles on older browsers.
    shapes: ['square', 'circle'],
    // Softer physics: lower velocity and wider spread for a gentler,
    // drifting confetti rather than an explosive burst.
    ticks: 180,
    scalar: 0.85,
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
    if (open && !wasOpen.current && !reduceMotion) {
      fireConfetti();
      lastFocusedRef.current = document.activeElement as HTMLElement | null;
      requestAnimationFrame(() => {
        const first = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
        (first ?? dialogRef.current)?.focus();
      });
    }
    wasOpen.current = open;
  }, [open, reduceMotion]);

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
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            data-testid="win-backdrop"
            style={{
              background: 'color-mix(in oklch, var(--surface-elevated) 58%, transparent)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
            }}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label="Bingo win"
              tabIndex={-1}
              className="w-full max-w-sm rounded-2xl p-8 text-center shadow-lg outline-none glass-panel"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 20 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 10 }}
              transition={
                reduceMotion
                  ? { duration: 0.15 }
                  : { type: 'spring', stiffness: 280, damping: 28 }
              }
            >
              <motion.h2
                className="font-heading text-5xl tracking-wide"
                style={{ color: 'var(--text-primary)' }}
                initial={reduceMotion ? undefined : { scale: 0.65, opacity: 0 }}
                animate={reduceMotion ? undefined : { scale: 1, opacity: 1 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 320, damping: 18, delay: 0.1 }
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
                className="mt-6"
                style={{
                  background: 'var(--accent)',
                  color: 'var(--surface-base)',
                  border: 'none',
                }}
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
