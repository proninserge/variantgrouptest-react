import type { ReactElement } from 'react';

import { selectCompletedCount, useApplicationStore } from '@/entities/application';
import { useUserStore } from '@/entities/user';
import { CreateApplicationButton } from '@/features/create-application';
import { ProgressDotBar } from '@/shared/ui/progress-dot-bar';
import { HStack, VStack } from '@/shared/ui/stack';
import { Typography } from '@/shared/ui/typography';

import styles from './styles.module.scss';

export function GoalBanner(): ReactElement {
  const filled = useApplicationStore(selectCompletedCount);
  const total = useUserStore((s) => s.applicationGoal);
  return (
    <HStack
      as="aside"
      align="center"
      justify="center"
      className={styles.root}
      aria-label="Application creation progress"
    >
      <VStack align="center" gap="2xl" className={styles.container}>
        <VStack align="center" gap="md" fullWidth>
          <Typography variant="h2" color="text-primary" weight="semibold" as="h2">
            Hit your goal
          </Typography>
          <Typography variant="md" color="text-secondary">
            Generate and send out couple more job applications today to get hired faster
          </Typography>

          <CreateApplicationButton size="lg" iconSize="lg" />
        </VStack>

        <VStack align="center" gap="xs" fullWidth>
          <ProgressDotBar total={total} filled={filled} variant="lines" />
          <Typography
            variant="md"
            color="text-secondary"
            as="p"
            aria-live="polite"
            aria-atomic="true"
          >
            {filled} out of {total}
          </Typography>
        </VStack>
      </VStack>
    </HStack>
  );
}
