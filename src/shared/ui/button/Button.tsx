import clsx from 'clsx';
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ComponentPropsWithoutRef,
  ReactElement,
  ReactNode,
} from 'react';
import { Link } from 'react-router';

import { Loader } from '@/shared/ui/loader';
import { HStack } from '@/shared/ui/stack';
import { Typography } from '@/shared/ui/typography';

import styles from './styles.module.scss';

type ButtonVariant = 'primary' | 'secondary' | 'transparent';
export type ButtonSize = 'lg' | 'md' | 'sm' | 'xs';

type SharedProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isLoading?: boolean;
  labelClassName?: string | undefined;
};

type AsButton = ButtonHTMLAttributes<HTMLButtonElement> & SharedProps & { as?: 'button' };
type AsAnchor = AnchorHTMLAttributes<HTMLAnchorElement> & SharedProps & { as: 'a' };
type AsLink = ComponentPropsWithoutRef<typeof Link> & SharedProps & { as: typeof Link };

type WithChildren = { children: ReactNode };
type IconOnly = { children?: never; 'aria-label': string };

type ButtonProps = (AsButton | AsAnchor | AsLink) & (WithChildren | IconOnly);

const variantClassMap: Record<ButtonVariant, string | undefined> = {
  primary: styles.variantPrimary,
  secondary: styles.variantSecondary,
  transparent: styles.variantTransparent,
};

const sizeClassMap: Record<ButtonSize, string | undefined> = {
  lg: styles.sizeLg,
  md: styles.sizeMd,
  sm: styles.sizeSm,
  xs: styles.sizeXs,
};

const typographyVariantMap: Record<ButtonSize, 'xs' | 'sm' | 'md'> = {
  lg: 'md',
  md: 'sm',
  sm: 'xs',
  xs: 'xs',
};

const sizeGapMap: Record<ButtonSize, 'xs' | 'sm'> = {
  lg: 'sm',
  md: 'xs',
  sm: 'xs',
  xs: 'xs',
};

export function Button({
  as: Tag = 'button',
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  children,
  className,
  labelClassName,
  isLoading = false,
  ...rest
}: ButtonProps): ReactElement {
  const isDisabled = ('disabled' in rest && rest.disabled) || isLoading;

  const rootClassName = clsx(
    styles.root,
    variantClassMap[variant],
    sizeClassMap[size],
    isDisabled && styles.disabled,
    isLoading && styles.loading,
    className,
  );

  const content = (
    <>
      {isLoading && <Loader className={styles.spinner} />}
      <HStack
        align="center"
        justify="center"
        gap={sizeGapMap[size]}
        fullWidth
        className={isLoading ? styles.contentHidden : undefined}
      >
        {leftIcon && <span className={styles.icon}>{leftIcon}</span>}
        {children !== undefined && (
          <Typography
            variant={typographyVariantMap[size]}
            color="inherit"
            weight="semibold"
            as="span"
            className={labelClassName}
          >
            {children}
          </Typography>
        )}
        {rightIcon && <span className={styles.icon}>{rightIcon}</span>}
      </HStack>
    </>
  );

  if (Tag === Link) {
    return (
      <Link
        {...(rest as ComponentPropsWithoutRef<typeof Link>)}
        aria-disabled={isDisabled || undefined}
        aria-busy={isLoading || undefined}
        className={rootClassName}
      >
        {content}
      </Link>
    );
  }

  if (Tag === 'a') {
    return (
      <a
        {...(rest as AsAnchor)}
        aria-disabled={isDisabled || undefined}
        aria-busy={isLoading || undefined}
        className={rootClassName}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      {...(rest as AsButton)}
      type={(rest as AsButton).type ?? 'button'}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      aria-disabled={isDisabled || undefined}
      className={rootClassName}
    >
      {content}
    </button>
  );
}
