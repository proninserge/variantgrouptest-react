import type { ReactElement, ReactNode } from 'react';

import { Loader } from '@/shared/ui/loader';
import { HStack } from '@/shared/ui/stack';
import { Typography } from '@/shared/ui/typography';

import type { Application } from '../model/types';
import styles from './styles.module.scss';

type ApplicationCardProps = {
  application: Application;
  isLoading?: boolean;
  controls?: ReactNode;
};

export function ApplicationCard({
  application,
  isLoading = false,
  controls,
}: ApplicationCardProps): ReactElement {
  return (
    <article className={styles.root}>
      {isLoading ? (
        <HStack justify="center" align="center" className={styles.loaderWrapper}>
          <Loader className={styles.loaderIcon} />
        </HStack>
      ) : (
        <>
          <div className={styles.body}>
            <Typography variant="md" color="text-secondary" className={styles.text}>
              {application.application}
            </Typography>
            <div className={styles.fade} aria-hidden="true" />
          </div>

          <HStack justify="between" align="center" className={styles.footer}>
            {controls}
          </HStack>
        </>
      )}
    </article>
  );
}
