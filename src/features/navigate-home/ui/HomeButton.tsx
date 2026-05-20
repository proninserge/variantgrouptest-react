import type { ReactElement } from 'react';
import { useNavigate } from 'react-router';

import { RoutePaths } from '@/shared/config';
import type { ButtonSize } from '@/shared/ui/button';
import { Button } from '@/shared/ui/button';
import { HomeIcon, Icon } from '@/shared/ui/Icon';

type HomeButtonProps = {
  className?: string | undefined;
  size?: ButtonSize;
};

export function HomeButton({ className, size = 'sm' }: HomeButtonProps): ReactElement {
  const navigate = useNavigate();

  return (
    <Button
      variant="secondary"
      size={size}
      aria-label="Go to home page"
      leftIcon={<Icon icon={HomeIcon} size="md" />}
      className={className}
      onClick={() => {
        void navigate(RoutePaths.home);
      }}
    />
  );
}
