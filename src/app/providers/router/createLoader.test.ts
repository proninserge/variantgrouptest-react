import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-router', () => ({
  redirect: vi.fn((path: string) => ({ _redirect: path })),
}));

import { redirect } from 'react-router';

import { useApplicationStore } from '@/entities/application';
import { RoutePaths } from '@/shared/config';

import { createRouteLoader } from './createLoader';

const COMPLETED_APP = {
  id: '1',
  jobTitle: 'Engineer',
  companyName: 'Acme Corp',
  skills: 'React',
  additionalDetails: 'Details',
  application: 'Dear Team...',
  generationStatus: 'idle' as const,
};

const GENERATING_APP = {
  ...COMPLETED_APP,
  application: null,
  generationStatus: 'generating' as const,
};

beforeEach(() => {
  useApplicationStore.setState({ applications: [] });
  vi.clearAllMocks();
});

describe('createRouteLoader', () => {
  it('returns null when no application is generating', () => {
    expect(createRouteLoader()).toBeNull();
  });

  it('redirects to home when an application is generating', () => {
    useApplicationStore.setState({ applications: [GENERATING_APP] });
    createRouteLoader();
    expect(redirect).toHaveBeenCalledWith(RoutePaths.home);
  });

  it('does not redirect when all applications are completed', () => {
    useApplicationStore.setState({ applications: [COMPLETED_APP] });
    expect(createRouteLoader()).toBeNull();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('redirects when at least one application is generating among multiple', () => {
    useApplicationStore.setState({
      applications: [COMPLETED_APP, GENERATING_APP],
    });
    createRouteLoader();
    expect(redirect).toHaveBeenCalledTimes(1);
    expect(redirect).toHaveBeenCalledWith(RoutePaths.home);
  });

  it('redirects when a completed application is being regenerated', () => {
    useApplicationStore.setState({
      applications: [{ ...COMPLETED_APP, generationStatus: 'generating' as const }],
    });
    createRouteLoader();
    expect(redirect).toHaveBeenCalledWith(RoutePaths.home);
  });

  it('allows navigation after a failed regeneration removes the generating entry', () => {
    useApplicationStore.setState({ applications: [] });

    expect(createRouteLoader()).toBeNull();
    expect(redirect).not.toHaveBeenCalled();
  });
});
