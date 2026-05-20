import { beforeEach, describe, expect, it } from 'vitest';

import { useGenerationStore } from './store';
import type { GenerateApplicationFormValues } from './types';

const FORM_VALUES: GenerateApplicationFormValues = {
  jobTitle: 'Frontend Engineer',
  companyName: 'Acme Corp',
  skills: 'TypeScript React Node.js GraphQL REST APIs Docker Kubernetes CI CD',
  additionalDetails:
    'I have 5 years of experience building scalable web applications with modern frameworks.',
};

beforeEach(() => {
  useGenerationStore.setState({
    status: 'idle',
    formValues: null,
    generatedContent: null,
    error: null,
    resetSignal: 0,
  });
});

describe('setGenerating', () => {
  it('transitions status to "generating" and stores form values', () => {
    useGenerationStore.getState().setGenerating(FORM_VALUES);

    const state = useGenerationStore.getState();
    expect(state.status).toBe('generating');
    expect(state.formValues).toEqual(FORM_VALUES);
  });

  it('clears previous content and error', () => {
    useGenerationStore.setState({ generatedContent: 'old content', error: 'old error' });
    useGenerationStore.getState().setGenerating(FORM_VALUES);

    const state = useGenerationStore.getState();
    expect(state.generatedContent).toBeNull();
    expect(state.error).toBeNull();
  });
});

describe('setSuccess', () => {
  it('transitions status to "success" and stores the generated content', () => {
    useGenerationStore.getState().setSuccess('Dear Hiring Team, ...');

    const state = useGenerationStore.getState();
    expect(state.status).toBe('success');
    expect(state.generatedContent).toBe('Dear Hiring Team, ...');
  });
});

describe('setError', () => {
  it('transitions status to "error" and stores the error message', () => {
    useGenerationStore.getState().setError('Network timeout');

    const state = useGenerationStore.getState();
    expect(state.status).toBe('error');
    expect(state.error).toBe('Network timeout');
  });
});

describe('resetState', () => {
  it('resets all fields to their initial values', () => {
    useGenerationStore.getState().setGenerating(FORM_VALUES);
    useGenerationStore.getState().setSuccess('some content');
    useGenerationStore.getState().resetState();

    const state = useGenerationStore.getState();
    expect(state.status).toBe('idle');
    expect(state.formValues).toBeNull();
    expect(state.generatedContent).toBeNull();
    expect(state.error).toBeNull();
  });

  it('increments resetSignal on each call to trigger the form reset effect', () => {
    const initial = useGenerationStore.getState().resetSignal;

    useGenerationStore.getState().resetState();
    expect(useGenerationStore.getState().resetSignal).toBe(initial + 1);

    useGenerationStore.getState().resetState();
    expect(useGenerationStore.getState().resetSignal).toBe(initial + 2);
  });
});
