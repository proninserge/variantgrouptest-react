import clsx from 'clsx';
import type { FC, SVGProps } from 'react';

import styles from './styles.module.scss';

export type SvgIcon = FC<SVGProps<SVGSVGElement>>;

const iconSizeClass = {
  xs: styles.sizeXs,
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
} as const;

export type IconSize = keyof typeof iconSizeClass;

type IconProps = {
  icon: SvgIcon;
  size?: IconSize;
  label?: string | undefined;
  className?: string | undefined;
};

export function Icon({ icon: SvgComponent, size = 'md', label, className }: IconProps) {
  return (
    <SvgComponent
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
      focusable="false"
      className={clsx(styles.root, iconSizeClass[size], className)}
    />
  );
}
