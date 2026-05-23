import clsx from 'clsx';
import type { ReactElement } from 'react';

import { useGenerateApplication } from '@/features/generate-application';
import { HStack } from '@/shared/ui/stack';
import { Typography } from '@/shared/ui/typography';

import styles from './styles.module.scss';

type CreateHeaderProps = {
  className?: string | undefined;
};

export function CreateHeader({ className }: CreateHeaderProps): ReactElement {
  const { formValues, status } = useGenerateApplication();

  const isFilled = status !== 'idle' && formValues !== null;
  const title = isFilled ? `${formValues.jobTitle}, ${formValues.companyName}` : 'New application';

  return (
    <HStack
      aria-labelledby="create-application-heading"
      align="center"
      justify="between"
      fullWidth
      className={clsx(styles.root, className)}
    >
      <Typography
        as="h2"
        id="create-application-heading"
        variant="h2"
        color={isFilled ? 'text-primary' : 'text-secondary'}
        weight="semibold"
      >
        {title}
      </Typography>
    </HStack>
  );
}
