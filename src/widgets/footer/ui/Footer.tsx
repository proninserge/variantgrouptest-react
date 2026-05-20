import clsx from 'clsx';
import type { ReactElement } from 'react';

import styles from './styles.module.scss';

type FooterProps = {
  className?: string | undefined;
};

export function Footer({ className }: FooterProps): ReactElement {
  return <div className={clsx(styles.footer, className)} />;
}
