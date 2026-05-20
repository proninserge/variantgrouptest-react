import type { ReactElement } from 'react';

import { Loader } from '@/shared/ui/loader';

import styles from './styles.module.scss';

export function PageLoader(): ReactElement {
  return (
    <div className={styles.root} role="status" aria-label="Загрузка страницы">
      <Loader className={styles.icon} />
    </div>
  );
}
