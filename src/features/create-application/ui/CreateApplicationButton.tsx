import type { ReactElement } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';

import { selectHasPending, useApplicationStore } from '@/entities/application';
import { Anchors, RoutePaths } from '@/shared/config';
import type { ButtonSize } from '@/shared/ui/button';
import { Button } from '@/shared/ui/button';
import { Icon, type IconSize, PlusIcon } from '@/shared/ui/Icon';

import styles from './styles.module.scss';

type CreateApplicationButtonProps = {
  className?: string | undefined;
  size?: ButtonSize;
  iconSize?: IconSize;
  isResponsive?: boolean;
};

export function CreateApplicationButton({
  className,
  size = 'md',
  iconSize = 'md',
  isResponsive = false,
}: CreateApplicationButtonProps): ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  const isGenerating = useApplicationStore(selectHasPending);

  const isOnCreatePage = location.pathname === RoutePaths.create;

  const sharedProps = {
    variant: 'primary' as const,
    size,
    leftIcon: <Icon icon={PlusIcon} size={iconSize} />,
    className,
    labelClassName: isResponsive ? styles.label : undefined,
  };

  if (!isOnCreatePage && !isGenerating) {
    return (
      <Button {...sharedProps} as={Link} to={RoutePaths.create} state={{ resetForm: true }}>
        Create New
      </Button>
    );
  }

  const handleClick = () => {
    void navigate(location.pathname, {
      replace: true,
      state: { resetForm: true },
    });
    document.getElementById(Anchors.createApplicationForm)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Button {...sharedProps} onClick={handleClick} disabled={isGenerating}>
      Create New
    </Button>
  );
}
