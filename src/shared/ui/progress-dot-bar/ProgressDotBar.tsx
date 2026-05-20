import clsx from 'clsx';
import type { ReactElement } from 'react';

import { HStack } from '@/shared/ui/stack';

import styles from './styles.module.scss';

export type ProgressDotBarVariant = 'dots' | 'lines';

export type ProgressDotBarProps = {
  total: number;
  filled: number;
  variant?: ProgressDotBarVariant;
  className?: string | undefined;
};

const variantClassMap: Record<ProgressDotBarVariant, string | undefined> = {
  dots: styles.variantDots,
  lines: styles.variantLines,
};

export function ProgressDotBar({
  total,
  filled,
  variant = 'dots',
  className,
}: ProgressDotBarProps): ReactElement {
  return (
    <HStack
      wrap="wrap"
      fullWidth
      align="center"
      justify="center"
      gap={variant === 'dots' ? '3xs' : 'xs'}
      className={clsx(variantClassMap[variant], className)}
      role="progressbar"
      aria-valuenow={filled}
      aria-valuemin={0}
      aria-valuemax={total}
    >
      {Array.from({ length: total }, (_, index) => (
        <span key={index} className={clsx(styles.item, index < filled && styles.itemFilled)} />
      ))}
    </HStack>
  );
}
