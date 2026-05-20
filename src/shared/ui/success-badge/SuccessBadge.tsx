import type { ReactElement } from 'react';

import { CheckmarkIcon, Icon } from '@/shared/ui/Icon';
import { HStack } from '@/shared/ui/stack';

import styles from './styles.module.scss';

export function SuccessBadge(): ReactElement {
  return (
    <HStack as="span" align="center" justify="center" aria-hidden={true} className={styles.root}>
      <Icon icon={CheckmarkIcon} size="xs" className={styles.icon} />
    </HStack>
  );
}
