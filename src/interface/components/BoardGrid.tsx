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
      staggerChildren: 0.055,
      delayChildren: 0.1,
    },
  },
};

const cellVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: 'easeOut' },
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
      <Card className="glass-panel shadow-sm">
        <CardContent className="p-6 sm:p-8">
          <h2 className="font-heading text-2xl mb-6 text-text-primary">Your Board</h2>

          {/* Current number display — soft pastel highlight with gentle pulse */}
          {current && (
            <motion.div
              initial={reduceMotion ? false : { scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 240, damping: 26 }}
              className="mb-6 flex justify-center"
            >
              <Badge
                variant="default"
                className="px-6 py-3 text-lg font-mono font-bold tracking-wider bg-accent text-surface-base shadow-sm called-pulse"
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
              'grid grid-cols-5 gap-3 sm:gap-4',
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
                      'w-full aspect-square flex items-center justify-center px-2',
                      'rounded-2xl border-2 font-mono font-semibold',
                      'select-none'
                    )}
                    style={{
                      background: 'var(--accent)',
                      color: 'var(--surface-base)',
                      borderColor: 'var(--accent)',
                    }}
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
                    whileHover={reduceMotion ? undefined : { y: -1.5 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.975 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className={cn(
                      'w-full aspect-square flex items-center justify-center gap-1.5 px-2',
                      'rounded-xl border-2 font-mono font-semibold',
                      'transition-colors duration-180 select-none',
                      getTextSizeClass(displayText),
                      'focus-visible:outline-none focus-visible:ring-2',
                      'focus-visible:ring-accent focus-visible:ring-offset-2',
                      'focus-visible:ring-offset-surface-base',
                      isWinning && 'winning-cell'
                    )}
                    style={
                      isCalled && !isCurrent
                        ? {
                            background: 'color-mix(in oklch, var(--accent) 16%, var(--surface-elevated))',
                            borderColor: 'var(--accent)',
                            color: 'var(--text-primary)',
                          }
                        : isCurrent
                        ? {
                            background: 'var(--accent)',
                            color: 'var(--surface-base)',
                            borderColor: 'var(--accent)',
                          }
                        : isWinning
                        ? {
                            background: 'color-mix(in oklch, var(--accent) 20%, var(--surface-elevated))',
                            borderColor: 'var(--accent)',
                            color: 'var(--surface-base)',
                          }
                        : {
                            background: 'var(--surface-elevated)',
                            color: 'var(--text-primary)',
                            borderColor: 'var(--border)',
                          }
                    }
                  >
                    {isCalled && !isCurrent && (
                      <Check
                        aria-hidden="true"
                        className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0"
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
          <div className="mt-5 flex flex-wrap gap-4 justify-center text-xs text-text-secondary">
            <span className="flex items-center gap-1.5">
              <span
                className="w-3.5 h-3.5 rounded-xl"
                style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)' }}
              />
              Uncalled
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="w-3.5 h-3.5 rounded-lg"
                style={{ background: 'var(--accent)', border: '1px solid var(--accent)' }}
              />
              Called
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="w-3.5 h-3.5 rounded-lg"
                style={{ background: 'var(--accent)', border: '1px solid var(--accent)', boxShadow: '0 0 0 1px color-mix(in oklch, var(--accent) 40%, transparent)' }}
              />
              Current
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="w-3.5 h-3.5 rounded-xl"
                style={{ background: 'var(--accent)', border: '1px solid var(--accent)' }}
              />
              Free
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
