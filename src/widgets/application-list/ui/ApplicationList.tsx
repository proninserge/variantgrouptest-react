import type { ReactElement } from 'react';

import { ApplicationCard, EmptyApplicationList, useApplicationStore } from '@/entities/application';
import { CopyApplicationButton } from '@/features/copy-application';
import { DeleteApplicationButton } from '@/features/delete-application';

import styles from './styles.module.scss';

export function ApplicationList(): ReactElement {
  const applications = useApplicationStore((s) => s.applications);

  if (applications.length === 0) {
    return <EmptyApplicationList />;
  }

  return (
    <ul className={styles.grid}>
      {applications.map((application) => {
        const isPending = application.application === null;

        return (
          <li key={application.id}>
            <ApplicationCard
              isLoading={isPending}
              application={application}
              controls={
                application.application !== null ? (
                  <>
                    <DeleteApplicationButton applicationId={application.id} />
                    <CopyApplicationButton text={application.application} />
                  </>
                ) : undefined
              }
            />
          </li>
        );
      })}
    </ul>
  );
}
