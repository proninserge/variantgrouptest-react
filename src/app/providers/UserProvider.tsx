import type { ReactElement, ReactNode } from 'react';
import { useEffect } from 'react';

import { useUserStore } from '@/entities/user';

/**
 * Провайдер для инициализации состояния пользователя.
 * На данный момент используется ТОЛЬКО для инициализации количества писем.
 * Например если авторизованный пользователь имеет другое количество писем, или если есть подписка.
 * Обрабатывается только этот случай, но само наличие провайдера позволяет расширить его функциональность в будущем.
 */

type UserProviderProps = {
  children: ReactNode;
};

const DEFAULT_APPLICATION_GOAL = 5;

export function UserProvider({ children }: UserProviderProps): ReactElement {
  const setApplicationGoal = useUserStore((s) => s.setApplicationGoal);

  useEffect(() => {
    setApplicationGoal(DEFAULT_APPLICATION_GOAL);
  }, [setApplicationGoal]);

  return <>{children}</>;
}
