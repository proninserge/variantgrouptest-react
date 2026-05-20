import clsx from 'clsx';
import type { CSSProperties, ElementType, HTMLAttributes, ReactElement, ReactNode } from 'react';

import styles from './styles.module.scss';

type JustifyContent = 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
type AlignItems = 'start' | 'end' | 'center' | 'stretch' | 'baseline';
type GapToken = 'none' | '3xs' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
type WrapValue = 'wrap' | 'nowrap' | 'wrap-reverse';

type StackProps<T extends ElementType = 'div'> = HTMLAttributes<HTMLElement> & {
  direction: 'row' | 'column';
  justify?: JustifyContent;
  align?: AlignItems;
  gap?: GapToken;
  wrap?: WrapValue;
  fullWidth?: boolean;
  fullHeight?: boolean;
  as?: T;
  children?: ReactNode;
  style?: CSSProperties;
};

const directionClassMap: Record<'row' | 'column', string | undefined> = {
  row: styles.directionRow,
  column: styles.directionColumn,
};

const justifyClassMap: Record<JustifyContent, string | undefined> = {
  start: styles.justifyStart,
  end: styles.justifyEnd,
  center: styles.justifyCenter,
  between: styles.justifyBetween,
  around: styles.justifyAround,
  evenly: styles.justifyEvenly,
};

const alignClassMap: Record<AlignItems, string | undefined> = {
  start: styles.alignStart,
  end: styles.alignEnd,
  center: styles.alignCenter,
  stretch: styles.alignStretch,
  baseline: styles.alignBaseline,
};

const gapClassMap: Record<Exclude<GapToken, 'none'>, string | undefined> = {
  '3xs': styles.gap3xs,
  '2xs': styles.gap2xs,
  xs: styles.gapXs,
  sm: styles.gapSm,
  md: styles.gapMd,
  lg: styles.gapLg,
  xl: styles.gapXl,
  '2xl': styles.gap2xl,
  '3xl': styles.gap3xl,
};

const wrapClassMap: Record<Exclude<WrapValue, 'nowrap'>, string | undefined> = {
  wrap: styles.wrapWrap,
  'wrap-reverse': styles.wrapWrapReverse,
};

function Stack<T extends ElementType = 'div'>({
  direction,
  justify = 'start',
  align = 'start',
  gap = 'none',
  wrap = 'nowrap',
  fullWidth = false,
  fullHeight = false,
  as,
  children,
  className,
  ...rest
}: StackProps<T>): ReactElement {
  const Component = as ?? 'div';

  return (
    <Component
      {...rest}
      className={clsx(
        styles.root,
        directionClassMap[direction],
        justifyClassMap[justify],
        alignClassMap[align],
        gap !== 'none' && gapClassMap[gap],
        wrap !== 'nowrap' && wrapClassMap[wrap],
        fullWidth && styles.fullWidth,
        fullHeight && styles.fullHeight,
        className,
      )}
    >
      {children}
    </Component>
  );
}

export type VStackProps<T extends ElementType = 'div'> = Omit<StackProps<T>, 'direction'>;
export type HStackProps<T extends ElementType = 'div'> = Omit<StackProps<T>, 'direction'>;

export function VStack<T extends ElementType = 'div'>({ ...rest }: VStackProps<T>): ReactElement {
  return <Stack direction="column" {...(rest as Omit<StackProps<T>, 'direction'>)} />;
}

export function HStack<T extends ElementType = 'div'>({ ...rest }: HStackProps<T>): ReactElement {
  return <Stack direction="row" {...(rest as Omit<StackProps<T>, 'direction'>)} />;
}
