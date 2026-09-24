'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Button } from '@/interface/components/ui/button';

interface Props {
  /** Whether the celebration is showing. */
  open: boolean;
  /** Called when the player dismisses the celebration. */
  onClose: () => void;
  /** How many lines completed the bingo, when known. */
  lines?: number;
}

/** One confetti burst from the center of the screen (spec step 7). */
function fireConfetti() {
  confetti({
    particleCount: 150,
    spread: 70,
    startVelocity: 45,
    origin: { x: 0.5, y: 0.4 },
    // Amber accent palette from the OKLCH color system.
    colors: ['#fbbf24', '#f59e0b', '#fff'],
    disableForReducedMotion: true, // built-in: no confetti when reduced motion
  });
}

// Focusable elements inside the modal, in tab order.
const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * BINGO! win celebration: a full-screen confetti burst plus a spring-in
 * modal announcing the win.
 *
 * The confetti fires once per open transition (not per render), and both
 * the burst and the modal animation respect prefers-reduced-motion.
 *
 * Accessibility (WCAG 2.4.3 / 2.1.2): when the modal opens, focus moves
 * into it and is trapped until it closes; when it closes, focus returns to
 * the element that had it before.
 */
export default function WinCelebration({ open, onClose, lines }: Props) {
  const reduceMotion = useReducedMotion();
  const wasOpen = useRef(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  // Fire the confetti burst on the closed -> open transition only, and
  // capture + move focus into the modal.
  useEffect(() => {
    if (open && !wasOpen.current) {
      fireConfetti();
      lastFocusedRef.current = document.activeElement as HTMLElement | null;
      // Focus the first focusable element (the Play again button) once the
      // modal has mounted.
      requestAnimationFrame(() => {
        const first = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
        (first ?? dialogRef.current)?.focus();
      });
    }
    wasOpen.current = open;
  }, [open]);

  // Restore focus to the trigger when the celebration closes.
  useEffect(() => {
    if (!open && lastFocusedRef.current) {
      lastFocusedRef.current.focus?.();
      lastFocusedRef.current = null;
    }
  }, [open]);

  // Escape closes the celebration; Tab is trapped inside the modal
  // (WCAG 2.1.2 — no keyboard escape from a modal except via its controls).
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
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            data-testid="win-backdrop"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label="Bingo win"
              tabIndex={-1}
              className="w-full max-w-sm rounded-xl border border-border bg-surface-elevated p-8 text-center shadow-lg outline-none"
              // Reduced motion: fade only — no spring scale transform.
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
                className="font-display text-6xl tracking-wide text-accent"
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
                className="mt-6"
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
