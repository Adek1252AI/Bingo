'use client';

import * as React from 'react';
import { Card, CardContent } from '@/interface/components/ui/card';
import { Badge } from '@/interface/components/ui/badge';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/interface/lib/cn';
import type { Cell } from '@/domain/rules/bingo-rules';

interface Props {
  grid: string[][];
  /** Words that have already been called — shown highlighted */
  called?: string[];
  /** The most recently called word — shown prominently */
  current?: string;
  /** Value used for the free (center) cell, defaults to 'FREE' */
  freeCell?: string;
  /**
   * Changing this key re-triggers the staggered entrance animation
   * (e.g. pass the share link or a counter when a new board is generated).
   */
  entranceKey?: string;
  /** Cells on a completed line — highlighted with a glow */
  winningCells?: Cell[];
  /** Called when the player taps/clicks a cell to mark (daub) it */
  onCellToggle?: (word: string) => void;
}

/**
 * Map cell content length to a responsive font-size class.
 * Short text gets larger classes; long text shrinks to fit.
 * The `sm:` / `md:` variants prevent overflow on smaller viewports
 * while preserving the visual hierarchy between short and long labels.
 */
export function getTextSizeClass(text: string): string {
  const len = text.length;
  if (len <= 4) return 'text-lg sm:text-xl md:text-2xl';
  if (len <= 10) return 'text-base sm:text-lg md:text-xl';
  if (len <= 20) return 'text-sm sm:text-base md:text-lg';
  return 'text-xs sm:text-sm md:text-base';
}

// Staggered entrance (spec step 6): cards fade in and slide up one by one
// over 300ms each. 30ms between cards keeps the wave visible while landing
// the whole 25-card board in about a second (snappy, per the spec's intent).
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.1,
    },
  },
};

const cellVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function BoardGrid({
  grid,
  called = [],
  current,
  freeCell = 'FREE',
  entranceKey,
  winningCells = [],
  onCellToggle,
}: Props) {
  const reduceMotion = useReducedMotion();

  const winningKeys = new Set(winningCells.map(([r, c]) => `${r}-${c}`));

  return (
    <div className="mt-6">
      <Card className="border-border bg-surface-elevated">
        <CardContent className="p-4 sm:p-6">
          <h2 className="font-display text-2xl mb-4 text-text-primary">Your Board</h2>

          {/* Current number display */}
          {current && (
            <motion.div
              initial={reduceMotion ? false : { scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="mb-4 flex justify-center"
            >
              <Badge
                variant="default"
                className="px-6 py-3 text-lg font-mono font-bold tracking-wider shadow-lg"
              >
                {current}
              </Badge>
            </motion.div>
          )}

          {/* 5x5 Grid — staggered entrance, re-triggered by entranceKey */}
          <motion.div
            key={entranceKey ?? 'board'}
            data-board-key={entranceKey ?? 'board'}
            className={cn(
              'grid grid-cols-5 gap-2 sm:gap-3',
              'mx-auto max-w-[600px]'
            )}
            variants={containerVariants}
            // Reduced motion: skip the stagger, render everything visible.
            initial={reduceMotion ? false : 'hidden'}
            animate="visible"
          >
            {grid.map((row, r) =>
              row.map((cell, c) => {
                const isFree = cell === freeCell;
                const isCalled = called.includes(cell);
                const isCurrent = cell === current;
                const isWinning = winningKeys.has(`${r}-${c}`);
                const index = r * 5 + c;

                // Inner element: a button when daubable, a plain div for the
                // free cell (it can never be marked).
                const inner = isFree ? (
                  <div
                    className={cn(
                      'aspect-square flex items-center justify-center px-1',
                      'rounded-lg border font-mono font-semibold',
                      'select-none overflow-hidden',
                      getTextSizeClass(cell),
                      'bg-surface text-muted-foreground border-border',
                      'italic font-normal'
                    )}
                  >
                    {cell}
                  </div>
                ) : (
                  <motion.button
                    type="button"
                    aria-pressed={isCalled}
                    onClick={() => onCellToggle?.(cell)}
                    // Micro-interaction (spec 5.1): lift on hover, press
                    // feedback on tap.
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.94 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className={cn(
                      'aspect-square flex items-center justify-center gap-1 px-1',
                      'rounded-lg border font-mono font-semibold',
                      'transition-colors duration-150 select-none',
                      getTextSizeClass(cell),
                      'overflow-hidden',
                      'focus-visible:outline-none focus-visible:ring-2',
                      'focus-visible:ring-accent focus-visible:ring-offset-2',
                      'focus-visible:ring-offset-surface-elevated',

                      // Default (uncalled) cell
                      !isCalled && !isCurrent && [
                        'bg-surface-elevated text-text-primary',
                        'border-border hover:border-border-hover',
                        'hover:shadow-md',
                      ],

                      // Called cell — highlighted accent (+ check icon so
                      // color is not the only signal, spec 5.2)
                      isCalled && !isCurrent && [
                        'bg-accent text-surface-base border-accent',
                        'shadow-md',
                      ],

                      // Current cell — prominent with glow (same font size
                      // as other cells; emphasis via color + ring + shadow)
                      isCurrent && [
                        'bg-primary text-primary-foreground border-primary',
                        'shadow-lg ring-2 ring-primary/50',
                      ],

                      // Winning cells — glow highlight (spec step 7)
                      isWinning && 'winning-cell ring-2 ring-accent shadow-glow'
                    )}
                  >
                    {isCalled && !isCurrent && (
                      <Check
                        aria-hidden="true"
                        className="h-3 w-3 sm:h-4 sm:w-4 shrink-0"
                      />
                    )}
                    <span className="break-words">{cell}</span>
                  </motion.button>
                );

                return (
                  <motion.div
                    key={`${r}-${c}`}
                    data-cell-index={index}
                    variants={cellVariants}
                  >
                    {inner}
                  </motion.div>
                );
              })
            )}
          </motion.div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-3 justify-center text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded border border-border bg-surface-elevated" />
              Uncalled
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-accent border border-accent" />
              Called
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-primary border border-primary ring-1 ring-primary/50" />
              Current
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-surface border border-border" />
              Free
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
