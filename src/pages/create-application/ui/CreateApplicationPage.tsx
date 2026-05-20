import type { ReactElement } from 'react';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { selectCompletedCount, useApplicationStore } from '@/entities/application';
import { useUserStore } from '@/entities/user';
import { useGenerationActions } from '@/features/generate-application';
import { Anchors } from '@/shared/config';
import { VStack } from '@/shared/ui/stack';
import { ApplicationPreview } from '@/widgets/application-preview';
import { CreateApplicationForm } from '@/widgets/create-application-form';
import { CreateHeader } from '@/widgets/create-header';
import { GoalBanner } from '@/widgets/goal-banner';

import styles from './styles.module.scss';

type CreatePageLocationState = {
  resetForm?: boolean;
} | null;

export function CreateApplicationPage(): ReactElement {
  const location = useLocation();
  const navigate = useNavigate();

  const applicationsCount = useApplicationStore(selectCompletedCount);
  const applicationGoal = useUserStore((s) => s.applicationGoal);
  const { triggerReset } = useGenerationActions();

  const showBanner = applicationsCount < applicationGoal;
  const locationState = location.state as CreatePageLocationState;

  useEffect(() => {
    if (!locationState?.resetForm) return;
    triggerReset();
    void navigate(location.pathname, { replace: true, state: null });
  }, [locationState?.resetForm, triggerReset, navigate, location.pathname]);

  return (
    <div className={styles.page}>
      <VStack gap="3xl" align="stretch">
        <div className={styles.content}>
          <VStack as="section" id={Anchors.createApplicationForm} gap="none" align="stretch">
            <CreateHeader />
            <CreateApplicationForm />
          </VStack>

          <div className={styles.output}>
            <ApplicationPreview />
          </div>
        </div>

        {showBanner && <GoalBanner />}
      </VStack>
    </div>
  );
}
