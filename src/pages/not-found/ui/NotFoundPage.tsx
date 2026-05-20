import type { ReactElement } from 'react';
import { useNavigate } from 'react-router';

import { RoutePaths } from '@/shared/config';
import { Button } from '@/shared/ui/button';
import { centeredPageStyles as styles } from '@/shared/ui/centered-page';
import { VStack } from '@/shared/ui/stack';
import { Typography } from '@/shared/ui/typography';

export function NotFoundPage(): ReactElement {
  const navigate = useNavigate();

  return (
    <VStack align="center" justify="center" fullWidth className={styles.root}>
      <VStack align="center" gap="md" className={styles.content}>
        <Typography variant="h1" color="success" weight="semibold">
          We can make this page if you wish
        </Typography>
        <Typography variant="h2" color="success" weight="semibold">
          Yet it does not exist 😔
        </Typography>
        <Button
          size="lg"
          onClick={() => {
            void navigate(RoutePaths.home);
          }}
        >
          Go home
        </Button>
      </VStack>
    </VStack>
  );
}
