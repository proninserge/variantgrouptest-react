import { zodResolver } from '@hookform/resolvers/zod';
import type { ReactElement } from 'react';
import { useEffect, useId, useRef } from 'react';
import { useForm } from 'react-hook-form';

import type { GenerateApplicationFormValues } from '@/features/generate-application';
import { generateApplicationSchema, useGenerateApplication } from '@/features/generate-application';
import { Button } from '@/shared/ui/button';
import { Icon, RepeatIcon } from '@/shared/ui/Icon';
import { Input } from '@/shared/ui/input';
import { HStack, VStack } from '@/shared/ui/stack';
import { Textarea } from '@/shared/ui/textarea';

import styles from './styles.module.scss';

export function CreateApplicationForm(): ReactElement {
  const formId = useId();
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  const { status, formResetKey, startGeneration } = useGenerateApplication();

  const isGenerating = status === 'generating';
  const isGenerated = status === 'success' || status === 'error';

  const hasGeneratedOnce = status !== 'idle';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<GenerateApplicationFormValues>({
    resolver: zodResolver(generateApplicationSchema),
    mode: 'onTouched',
    defaultValues: {
      jobTitle: '',
      companyName: '',
      skills: '',
      additionalDetails: '',
    },
  });

  useEffect(() => {
    if (formResetKey === 0) return;
    reset();
    firstInputRef.current?.focus();
  }, [formResetKey, reset]);

  const onSubmit = (values: GenerateApplicationFormValues) => {
    startGeneration(values);
  };

  const submitLabel = isGenerated ? 'Try Again' : 'Generate Now';
  const isSubmitDisabled = !isGenerated && (!isValid || isGenerating);

  const statusMessage = isGenerating
    ? 'Generating your application, please wait…'
    : status === 'success'
      ? 'Application generated successfully'
      : status === 'error'
        ? 'Generation failed, please try again'
        : '';

  const { ref: jobTitleRhfRef, ...jobTitleProps } = register('jobTitle');

  return (
    <form
      id={formId}
      onSubmit={(e) => {
        void handleSubmit(onSubmit)(e);
      }}
      noValidate
      aria-label="Create application"
      aria-busy={isGenerating}
      className={styles.form}
    >
      <span className={styles.srOnly} aria-live="polite" aria-atomic="true">
        {statusMessage}
      </span>

      <VStack gap="md" align="stretch">
        <HStack gap="md" wrap="wrap" fullWidth>
          <Input
            ref={(el) => {
              jobTitleRhfRef(el);
              firstInputRef.current = el;
            }}
            label="Job title"
            placeholder="Product manager"
            wrapperClassName={styles.rowInput}
            error={errors.jobTitle?.message}
            disabled={isGenerating}
            aria-required="true"
            {...jobTitleProps}
          />
          <Input
            label="Company"
            placeholder="Apple"
            wrapperClassName={styles.rowInput}
            error={errors.companyName?.message}
            disabled={isGenerating}
            aria-required="true"
            {...register('companyName')}
          />
        </HStack>

        <Input
          label="I am good at..."
          placeholder="HTML, CSS and doing things in time"
          error={errors.skills?.message}
          disabled={isGenerating}
          aria-required="true"
          {...register('skills')}
        />

        <Textarea
          label="Additional details"
          placeholder="Describe why you are a great fit or paste your bio"
          maxCount={1200}
          rows={8}
          error={errors.additionalDetails?.message}
          disabled={isGenerating}
          aria-required="true"
          {...register('additionalDetails')}
        />

        <Button
          type="submit"
          variant={hasGeneratedOnce ? 'secondary' : 'primary'}
          size="lg"
          disabled={isSubmitDisabled}
          isLoading={isGenerating}
          leftIcon={hasGeneratedOnce ? <Icon icon={RepeatIcon} size="md" /> : undefined}
          className={styles.submitButton}
        >
          {submitLabel}
        </Button>
      </VStack>
    </form>
  );
}
