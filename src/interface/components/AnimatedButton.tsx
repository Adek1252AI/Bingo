'use client';

import * as React from 'react';
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';

type Props = Omit<HTMLMotionProps<'button'>, 'ref'> & {
  children?: React.ReactNode;
};

/**
 * Button with micro-interactions (spec step 8): lifts 2px on hover, scales
 * to 0.97 on press, over a fast 150ms ease-out.
 *
 * Drop-in replacement for the legacy inline-styled <button> elements —
 * accepts style/className/disabled just like a plain button. Respects
 * prefers-reduced-motion by disabling the transform animations.
 */
export default function AnimatedButton({ type = 'button', ...props }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      type={type}
      whileHover={reduceMotion ? undefined : { y: -2, scale: 1.02 }}
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      {...props}
    />
  );
}
