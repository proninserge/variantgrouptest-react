import type { ReactElement } from 'react';

import { selectCompletedCount, useApplicationStore } from '@/entities/application';
import { useUserStore } from '@/entities/user';
import { VStack } from '@/shared/ui/stack';
import { ApplicationList } from '@/widgets/application-list';
import { GoalBanner } from '@/widgets/goal-banner';
import { HomeHeader } from '@/widgets/home-header';

import styles from './styles.module.scss';

export function HomePage(): ReactElement {
  const applicationsCount = useApplicationStore(selectCompletedCount);
  const applicationGoal = useUserStore((s) => s.applicationGoal);
  const showBanner = applicationsCount < applicationGoal;

  return (
    <div className={styles.page}>
      <HomeHeader className={styles.pageHeader} />

      <div className={styles.content}>
        <VStack gap="3xl">
          <ApplicationList />
          {showBanner && <GoalBanner />}
        </VStack>
      </div>
    </div>
  );
}
