'use client';

import * as React from 'react';
import { Card, CardContent } from '@/interface/components/ui/card';
import { Badge } from '@/interface/components/ui/badge';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/interface/lib/cn';
import type { Cell } from '@/domain/rules/bingo-rules';
import { anonymizeWord } from '@/interface/lib/name-anonymizer';

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
 */
export function getTextSizeClass(text: string): string {
  const len = text.length;
  if (len <= 4) return 'text-base sm:text-lg';
  if (len <= 10) return 'text-xs sm:text-sm';
  if (len <= 20) return 'text-[0.65rem] sm:text-xs';
  return 'text-[0.55rem] sm:text-[0.65rem]';
}

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
      <Card className="border-2 border-neutral-900 bg-white shadow-lg">
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
                className="px-6 py-3 text-lg font-mono font-bold tracking-wider shadow-lg bg-neutral-900 text-white"
              >
                {current}
              </Badge>
            </motion.div>
          )}

          {/* 5x5 Grid */}
          <motion.div
            key={entranceKey ?? 'board'}
            data-board-key={entranceKey ?? 'board'}
            className={cn(
              'grid grid-cols-5 gap-2 sm:gap-3',
              'mx-auto max-w-[600px]'
            )}
            variants={containerVariants}
            initial={reduceMotion ? false : 'hidden'}
            animate="visible"
            style={{ containerType: 'inline-size' }}
          >
            {grid.map((row, r) =>
              row.map((cell, c) => {
                const isFree = cell === freeCell;
                const isCalled = called.includes(cell);
                const isCurrent = cell === current;
                const isWinning = winningKeys.has(`${r}-${c}`);
                const index = r * 5 + c;

                const display = anonymizeWord(cell);
                const displayText = display
                  ? `${display.icon} ${display.label}`
                  : cell;

                const inner = isFree ? (
                  <div
                    className={cn(
                      'w-full aspect-square flex items-center justify-center px-1',
                      'rounded-lg border-2 font-mono font-semibold',
                      'select-none',
                      'bg-neutral-900 text-white border-neutral-900'
                    )}
                  >
                    <span
                      className="word-break-normal overflow-wrap-break-word"
                      style={{ fontSize: 'clamp(0.5rem, 2.2cqw, 0.85rem)' }}
                    >
                      {displayText}
                    </span>
                  </div>
                ) : (
                  <motion.button
                    type="button"
                    aria-pressed={isCalled}
                    onClick={() => onCellToggle?.(cell)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.94 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className={cn(
                      'w-full aspect-square flex items-center justify-center gap-1 px-1',
                      'rounded-lg border-2 font-mono font-semibold',
                      'transition-colors duration-150 select-none',
                      getTextSizeClass(displayText),
                      'focus-visible:outline-none focus-visible:ring-2',
                      'focus-visible:ring-accent focus-visible:ring-offset-2',
                      'focus-visible:ring-offset-white',

                      // Default (uncalled) cell — white with bold border
                      !isCalled && !isCurrent && [
                        'bg-white text-neutral-900',
                        'border-neutral-900 hover:border-neutral-700',
                        'hover:shadow-md',
                      ],

                      // Called cell — bold black with check
                      isCalled && !isCurrent && [
                        'bg-neutral-900 text-white border-neutral-900',
                        'shadow-md',
                      ],

                      // Current cell — highlighted
                      isCurrent && [
                        'bg-neutral-800 text-white border-neutral-800',
                        'shadow-lg ring-2 ring-neutral-800/50',
                      ],

                      // Winning cells
                      isWinning && 'winning-cell ring-2 ring-neutral-900 shadow-glow'
                    )}
                  >
                    {isCalled && !isCurrent && (
                      <Check
                        aria-hidden="true"
                        className="h-3 w-3 sm:h-4 sm:w-4 shrink-0"
                      />
                    )}
                    <span
                      className="word-break-normal overflow-wrap-break-word"
                      style={{ fontSize: 'clamp(0.5rem, 2.2cqw, 0.85rem)' }}
                    >
                      {displayText}
                    </span>
                  </motion.button>
                );

                return (
                  <motion.div
                    key={`${r}-${c}`}
                    data-cell-index={index}
                    className="min-w-0"
                    variants={cellVariants}
                    style={{ containerType: 'inline-size' }}
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
              <span className="w-3 h-3 rounded border-2 border-neutral-900 bg-white" />
              Uncalled
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-neutral-900 border-2 border-neutral-900" />
              Called
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-neutral-800 border-2 border-neutral-800 ring-1 ring-neutral-800/50" />
              Current
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-neutral-900 border-2 border-neutral-900" />
              Free
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
