import type { ReactElement } from 'react';

import { VStack } from '@/shared/ui/stack';
import { Typography } from '@/shared/ui/typography';

import styles from './styles.module.scss';

export function EmptyApplicationList(): ReactElement {
  return (
    <VStack align="center" justify="center" gap="xs" className={styles.emptyRoot}>
      <Typography variant="h2" as="h2" color="text-primary" weight="semibold">
        No applications yet
      </Typography>
      <Typography variant="md" color="text-secondary">
        Create your first application to get started
      </Typography>
    </VStack>
  );
}
