import clsx from 'clsx';
import type { ReactElement } from 'react';

import styles from './styles.module.scss';

type FooterProps = {
  className?: string | undefined;
};

export function Footer({ className }: FooterProps): ReactElement {
  return <footer className={clsx(styles.footer, className)} />;
}

// Left the Footer here for the future enhancements, removed in the layout
