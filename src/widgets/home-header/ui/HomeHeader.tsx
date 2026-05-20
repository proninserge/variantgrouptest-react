import clsx from 'clsx';
import type { ReactElement } from 'react';

import { CreateApplicationButton } from '@/features/create-application';
import { HStack } from '@/shared/ui/stack';
import { Typography } from '@/shared/ui/typography';

import styles from './styles.module.scss';

type HomeHeaderProps = {
  className?: string | undefined;
};

export function HomeHeader({ className }: HomeHeaderProps): ReactElement {
  return (
    <HStack
      aria-labelledby="home-heading"
      align="center"
      justify="between"
      fullWidth
      className={clsx(styles.root, className)}
    >
      <Typography as="h1" id="home-heading" variant="h1" color="text-primary" weight="semibold">
        Applications
      </Typography>

      <CreateApplicationButton isResponsive />
    </HStack>
  );
}
