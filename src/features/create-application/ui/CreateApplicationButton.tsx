import type { ReactElement } from 'react';
import { useLocation, useNavigate } from 'react-router';

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

  const handleClick = () => {
    const isOnCreatePage = location.pathname === RoutePaths.create;

    if (isOnCreatePage) {
      void navigate(location.pathname, {
        replace: true,
        state: { resetForm: true },
      });
      document
        .getElementById(Anchors.createApplicationForm)
        ?.scrollIntoView({ behavior: 'smooth' });
    } else {
      void navigate(RoutePaths.create, { state: { resetForm: true } });
    }
  };

  return (
    <Button
      variant="primary"
      size={size}
      leftIcon={<Icon icon={PlusIcon} size={iconSize} />}
      className={className}
      labelClassName={isResponsive ? styles.label : undefined}
      onClick={handleClick}
      disabled={isGenerating}
    >
      Create New
    </Button>
  );
}

// Кнопка перехода на экран создания
// Или если уже там - ресет формы
// Отключается при генерации, доп защита в дополнение к защите роута
// Можно скипнуть вместе с защитой роута, критично на UX не влияет, просто другой подход
