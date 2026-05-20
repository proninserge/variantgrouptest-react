import clsx from 'clsx';
import type { AriaAttributes, CSSProperties, HTMLAttributes, ReactElement, ReactNode } from 'react';

import styles from './styles.module.scss';

export type TypographyComponent = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';

export type TypographyVariant = 'xs' | 'sm' | 'md' | 'h1' | 'h2';

export type TypographyColor =
  | 'text-primary'
  | 'text-secondary'
  | 'text-tertiary'
  | 'text-base'
  | 'error'
  | 'label'
  | 'success'
  | 'inherit';

export type TypographyWeight = 'regular' | 'medium' | 'semibold';

export type TypographyProps = Pick<HTMLAttributes<HTMLElement>, 'id' | 'role'> &
  AriaAttributes & {
    variant?: TypographyVariant;
    color?: TypographyColor;
    weight?: TypographyWeight;
    as?: TypographyComponent;
    style?: CSSProperties;
    className?: string | undefined;
    children: ReactNode;
  };

const variantClassMap: Record<TypographyVariant, string | undefined> = {
  xs: styles.variantXs,
  sm: styles.variantSm,
  md: styles.variantMd,
  h1: styles.variantH1,
  h2: styles.variantH2,
};

const colorClassMap: Record<TypographyColor, string | undefined> = {
  'text-primary': styles.colorTextPrimary,
  'text-secondary': styles.colorTextSecondary,
  'text-tertiary': styles.colorTextTertiary,
  'text-base': styles.colorTextBase,
  error: styles.colorError,
  label: styles.colorLabel,
  success: styles.colorSuccess,
  inherit: undefined,
};

const weightClassMap: Record<TypographyWeight, string | undefined> = {
  regular: styles.weightRegular,
  medium: styles.weightMedium,
  semibold: styles.weightSemibold,
};

export function Typography({
  variant = 'md',
  color = 'text-secondary',
  weight = 'regular',
  as: Component = 'p',
  id,
  role,
  style,
  className,
  children,
  ...ariaProps
}: TypographyProps): ReactElement {
  return (
    <Component
      id={id}
      role={role}
      {...ariaProps}
      className={clsx(
        styles.root,
        variantClassMap[variant],
        colorClassMap[color],
        weightClassMap[weight],
        className,
      )}
      style={style}
    >
      {children}
    </Component>
  );
}
