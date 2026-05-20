import clsx from 'clsx';
import type { ReactElement } from 'react';

import { selectCompletedCount, useApplicationStore } from '@/entities/application';
import { useUserStore } from '@/entities/user';
import { HomeButton } from '@/features/navigate-home';
import LogomarkIcon from '@/shared/assets/logomark.svg?react';
import LogotypeIcon from '@/shared/assets/logotype.svg?react';
import { ProgressDotBar } from '@/shared/ui/progress-dot-bar';
import { HStack } from '@/shared/ui/stack';
import { SuccessBadge } from '@/shared/ui/success-badge';
import { Typography } from '@/shared/ui/typography';

import styles from './styles.module.scss';

const LABEL = 'applications generated';

type HeaderProps = {
  className?: string | undefined;
};

export function Header({ className }: HeaderProps): ReactElement {
  const filledStore = useApplicationStore(selectCompletedCount);
  const total = useUserStore((s) => s.applicationGoal);

  const filled = filledStore > total ? total : filledStore;
  const label = LABEL;

  return (
    <HStack
      as="header"
      aria-label="Main header"
      align="center"
      justify="between"
      fullWidth
      className={clsx(styles.root, className)}
    >
      <HStack align="center" gap="sm" className={styles.left} aria-label="Alt Shift">
        <LogomarkIcon aria-hidden={true} className={styles.logomark} />
        <LogotypeIcon aria-hidden={true} className={styles.logotype} />
      </HStack>

      <HStack align="center" gap="lg" className={styles.right}>
        <HStack role="status" aria-label="Application progress" align="center" gap="md">
          <Typography>
            {filled}/{total}
            <Typography as="span" className={styles.labelText}>
              &nbsp;{label}
            </Typography>{' '}
            {/* removed by styles not js */}
          </Typography>
          <HStack aria-hidden={true} align="center" className={styles.dotsContainer}>
            {filled === total ? (
              <SuccessBadge />
            ) : (
              <ProgressDotBar total={total} filled={filled} variant="dots" />
            )}
          </HStack>
        </HStack>

        <HomeButton />
      </HStack>
    </HStack>
  );
}
