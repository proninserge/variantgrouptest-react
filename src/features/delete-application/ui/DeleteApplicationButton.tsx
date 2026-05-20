import type { ReactElement } from 'react';

import { useApplicationStore } from '@/entities/application';
import { Button } from '@/shared/ui/button';
import { Icon, TrashIcon } from '@/shared/ui/Icon';

type DeleteApplicationButtonProps = {
  applicationId: string;
  isLoading?: boolean;
};

export function DeleteApplicationButton({
  applicationId,
  isLoading = false,
}: DeleteApplicationButtonProps): ReactElement {
  const removeApplication = useApplicationStore((s) => s.removeApplication);

  return (
    <Button
      variant="transparent"
      size="md"
      leftIcon={<Icon icon={TrashIcon} size="md" />}
      onClick={() => {
        removeApplication(applicationId);
      }}
      disabled={isLoading}
    >
      Delete
    </Button>
  );
}
