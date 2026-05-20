import clsx from 'clsx';
import { type ComponentPropsWithoutRef, forwardRef, type ReactElement, useId } from 'react';

import { VStack } from '@/shared/ui/stack';
import { Typography } from '@/shared/ui/typography';

import styles from './styles.module.scss';

export type InputVariant = 'default' | 'error';
export type InputSize = 'sm';

export type InputProps = Omit<ComponentPropsWithoutRef<'input'>, 'size'> & {
  label?: string | undefined;
  error?: string | undefined;
  variant?: InputVariant | undefined;
  size?: InputSize | undefined;
  wrapperClassName?: string | undefined;
};

const variantClassMap: Record<InputVariant, string | undefined> = {
  default: undefined,
  error: styles.variantError,
};

const sizeClassMap: Record<InputSize, string | undefined> = {
  sm: styles.sizeSm,
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      variant = 'default',
      size = 'sm',
      className,
      wrapperClassName,
      id,
      disabled,
      ...rest
    },
    ref,
  ): ReactElement => {
    const generatedId = useId();
    const resolvedId = id ?? generatedId;
    const errorId = `${resolvedId}-error`;
    const resolvedVariant: InputVariant = error ? 'error' : variant;

    return (
      <VStack gap="2xs" fullWidth className={wrapperClassName}>
        {label && (
          <label htmlFor={resolvedId} className={styles.labelText}>
            <Typography as="span" variant="xs" color="label" weight="medium">
              {label}
            </Typography>
          </label>
        )}
        <VStack fullWidth>
          <input
            {...rest}
            ref={ref}
            id={resolvedId}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            className={clsx(
              styles.input,
              variantClassMap[resolvedVariant],
              sizeClassMap[size],
              disabled && styles.disabled,
              className,
            )}
          />
          {error && (
            <Typography id={errorId} as="span" variant="xs" color="error" role="alert">
              {error}
            </Typography>
          )}
        </VStack>
      </VStack>
    );
  },
);

Input.displayName = 'Input';
