import clsx from 'clsx';
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactElement,
  useId,
  useState,
} from 'react';

import { HStack, VStack } from '@/shared/ui/stack';
import { Typography } from '@/shared/ui/typography';

import styles from './styles.module.scss';

export type TextareaVariant = 'default' | 'error';
export type TextareaSize = 'sm';

export type TextareaProps = Omit<ComponentPropsWithoutRef<'textarea'>, 'size'> & {
  label?: string | undefined;
  error?: string | undefined;
  variant?: TextareaVariant | undefined;
  size?: TextareaSize | undefined;
  wrapperClassName?: string | undefined;
  maxCount?: number | undefined;
};

const variantClassMap: Record<TextareaVariant, string | undefined> = {
  default: undefined,
  error: styles.variantError,
};

const sizeClassMap: Record<TextareaSize, string | undefined> = {
  sm: styles.sizeSm,
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
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
      maxCount,
      onChange,
      defaultValue,
      value,
      ...rest
    },
    ref,
  ): ReactElement => {
    const generatedId = useId();
    const resolvedId = id ?? generatedId;
    const errorId = `${resolvedId}-error`;
    const counterId = `${resolvedId}-counter`;

    const [count, setCount] = useState<number>(() => {
      const initial = value ?? defaultValue ?? '';
      return String(initial).length;
    });

    const isOverflow = maxCount !== undefined && count > maxCount;
    const hasError = !!error || isOverflow;
    const resolvedVariant: TextareaVariant = hasError ? 'error' : variant;

    const describedBy =
      [maxCount !== undefined ? counterId : null, hasError ? errorId : null]
        .filter(Boolean)
        .join(' ') || undefined;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCount(e.target.value.length);
      onChange?.(e);
    };

    return (
      <VStack gap="2xs" fullWidth className={wrapperClassName}>
        {label && (
          <label htmlFor={resolvedId} className={styles.labelText}>
            <Typography as="span" variant="xs" color="label" weight="medium">
              {label}
            </Typography>
          </label>
        )}
        <VStack fullWidth gap="2xs">
          <textarea
            {...rest}
            ref={ref}
            id={resolvedId}
            disabled={disabled}
            value={value}
            defaultValue={defaultValue}
            aria-invalid={hasError}
            aria-describedby={describedBy}
            onChange={handleChange}
            className={clsx(
              styles.textarea,
              variantClassMap[resolvedVariant],
              sizeClassMap[size],
              disabled && styles.disabled,
              className,
            )}
          />
          <HStack justify="between" fullWidth>
            {maxCount !== undefined && (
              <Typography
                id={counterId}
                as="span"
                variant="xs"
                color={isOverflow ? 'error' : 'text-tertiary'}
                role={isOverflow ? 'alert' : undefined}
                aria-label={`${String(count)} of ${String(maxCount)} characters`}
              >
                {count}/{maxCount}
              </Typography>
            )}
            {error && (
              <Typography id={errorId} as="span" variant="xs" color="error" role="alert">
                {error}
              </Typography>
            )}
          </HStack>
        </VStack>
      </VStack>
    );
  },
);

Textarea.displayName = 'Textarea';
