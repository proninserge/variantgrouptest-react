import type { FC, SVGProps } from 'react';

export type SvgIcon = FC<SVGProps<SVGSVGElement>>;

const iconSizeTokens = {
  xs: 'var(--size-12)',
  sm: 'var(--size-14)',
  md: 'var(--size-20)',
  lg: 'var(--size-24)',
} as const;

export type IconSize = keyof typeof iconSizeTokens;

type IconProps = {
  icon: SvgIcon;
  size?: IconSize;
  label?: string | undefined;
  className?: string | undefined;
};

export function Icon({ icon: SvgComponent, size = 'md', label, className }: IconProps) {
  const sizeValue = iconSizeTokens[size];

  return (
    <SvgComponent
      style={{ width: sizeValue, height: sizeValue, flexShrink: 0 }}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
      focusable="false"
      className={className}
    />
  );
}
