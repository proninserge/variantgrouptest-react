import { type ReactElement, useEffect, useRef } from 'react';

import { CopyApplicationButton } from '@/features/copy-application';
import { type GenerationStatus, useGenerateApplication } from '@/features/generate-application';
import { Anchors } from '@/shared/config';
import { HStack, VStack } from '@/shared/ui/stack';
import { Typography } from '@/shared/ui/typography';

import styles from './styles.module.scss';

type PreviewBodyProps = {
  status: GenerationStatus;
  content: string | null;
  error: string | null;
};

function PreviewBody({ status, content, error }: PreviewBodyProps): ReactElement {
  if (status === 'generating') {
    return (
      <HStack justify="center" align="center" className={styles.loaderWrapper}>
        <div className={styles.ball} role="status" aria-label="Loading" />
      </HStack>
    );
  }

  if (status === 'success' && content) {
    return (
      <Typography variant="md" color="text-secondary" className={styles.text}>
        {content}
      </Typography>
    );
  }

  if (status === 'error') {
    return (
      <Typography variant="md" color="error" className={styles.text}>
        {error ?? 'Something went wrong. Please try again.'}
      </Typography>
    );
  }

  return (
    <Typography variant="md" color="text-secondary" className={styles.text}>
      Your personalized job application will appear here...
    </Typography>
  );
}

export function ApplicationPreview(): ReactElement {
  const { status, generatedContent, error } = useGenerateApplication();

  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (status !== 'generating') return;
    rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [status]);

  return (
    <article ref={rootRef} id={Anchors.applicationPreview} className={styles.root}>
      <VStack className={styles.body}>
        <PreviewBody status={status} content={generatedContent} error={error} />
      </VStack>

      {status !== 'generating' && (
        <HStack justify="end" align="center" className={styles.footer}>
          <CopyApplicationButton text={generatedContent ?? ''} isLoading={!generatedContent} />
        </HStack>
      )}
    </article>
  );
}
