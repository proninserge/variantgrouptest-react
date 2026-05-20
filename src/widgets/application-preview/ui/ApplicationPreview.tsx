import { type ReactElement, useEffect, useRef } from 'react';

import { CopyApplicationButton } from '@/features/copy-application';
import { type GenerationStatus, useGenerationStore } from '@/features/generate-application';
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
        {/* При необходимости можно вынести
        В проекте уже есть лоадер, который можно переиспользовать
        Данный компонент выглядит как местный лоадер */}
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
      <Typography variant="md" color="error">
        {error ?? 'Something went wrong. Please try again.'}
      </Typography>
    );
  }

  return (
    <Typography variant="md" color="text-secondary">
      Your personalized job application will appear here...
    </Typography>
  );
}

export function ApplicationPreview(): ReactElement {
  const status = useGenerationStore((s) => s.status);
  const generatedContent = useGenerationStore((s) => s.generatedContent);
  const error = useGenerationStore((s) => s.error);

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

// Добавил отдельный компонент, хотя в сущности это та же карточка письма с дашборда
// Добавил отдельный чтобы разграничить функционал + лоадинг стейты
