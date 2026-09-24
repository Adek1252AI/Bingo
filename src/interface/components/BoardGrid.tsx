'use client';

import * as React from 'react';
import { Card, CardContent } from '@/interface/components/ui/card';
import { Badge } from '@/interface/components/ui/badge';
import { motion } from 'framer-motion';
import { cn } from '@/interface/lib/cn';

interface Props {
  grid: string[][];
  /** Words that have already been called — shown highlighted */
  called?: string[];
  /** The most recently called word — shown prominently */
  current?: string;
  /** Value used for the free (center) cell, defaults to 'FREE' */
  freeCell?: string;
}

export default function BoardGrid({ grid, called = [], current, freeCell = 'FREE' }: Props) {
  return (
    <div className="mt-6">
      <Card className="border-border bg-surface-elevated">
        <CardContent className="p-4 sm:p-6">
          <h2 className="font-display text-2xl mb-4 text-text-primary">Your Board</h2>

          {/* Current number display */}
          {current && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
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

          {/* 5x5 Grid */}
          <div
            className={cn(
              'grid grid-cols-5 gap-2 sm:gap-3',
              'mx-auto max-w-[400px]'
            )}
          >
            {grid.map((row, r) =>
              row.map((cell, c) => {
                const isFree = cell === freeCell;
                const isCalled = called.includes(cell);
                const isCurrent = cell === current;

                return (
                  <motion.div
                    key={`${r}-${c}`}
                    initial={isCurrent ? { scale: 1.1 } : { scale: 1 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  >
                    <div
                      className={cn(
                        // Base card cell styles
                        'aspect-square flex items-center justify-center',
                        'rounded-lg border font-mono font-semibold',
                        'transition-all duration-150 select-none',
                        // Responsive text sizing
                        'text-xs sm:text-sm md:text-base',

                        // Default (uncalled) cell
                        !isFree && !isCalled && !isCurrent && [
                          'bg-surface-elevated text-text-primary',
                          'border-border hover:border-border-hover',
                          'hover:shadow-md',
                        ],

                        // Called cell — highlighted accent
                        isCalled && !isCurrent && [
                          'bg-accent text-surface-base border-accent',
                          'shadow-md',
                        ],

                        // Current cell — prominent with glow
                        isCurrent && [
                          'bg-primary text-primary-foreground border-primary',
                          'shadow-lg ring-2 ring-primary/50',
                          'text-base sm:text-lg md:text-xl',
                        ],

                        // Free cell — distinct styling
                        isFree && [
                          'bg-surface text-muted-foreground border-border',
                          'italic font-normal',
                        ]
                      )}
                    >
                      {cell}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

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
