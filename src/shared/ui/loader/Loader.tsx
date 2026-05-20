import clsx from 'clsx';
import type { ReactElement } from 'react';

import { Icon, LoadingIcon } from '@/shared/ui/Icon';

import styles from './styles.module.scss';

type LoaderProps = {
  className?: string | undefined;
};

export function Loader({ className }: LoaderProps): ReactElement {
  return <Icon icon={LoadingIcon} className={clsx(styles.spin, className)} aria-hidden />;
}
