import type { ReactElement } from 'react';

import { syncApplicationAsDeleted } from '@/entities/application/lib/applicationSync';
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
  return (
    <Button
      variant="transparent"
      size="md"
      leftIcon={<Icon icon={TrashIcon} size="md" />}
      onClick={() => {
        syncApplicationAsDeleted(applicationId);
      }}
      disabled={isLoading}
    >
      Delete
    </Button>
  );
}
