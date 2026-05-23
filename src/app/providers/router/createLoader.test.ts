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
};

const PENDING_APP = { ...COMPLETED_APP, application: null };

beforeEach(() => {
  useApplicationStore.setState({ applications: [] });
  vi.clearAllMocks();
});

describe('createRouteLoader', () => {
  it('returns null when there are no pending applications', () => {
    expect(createRouteLoader()).toBeNull();
  });

  it('redirects to home when there is a pending application', () => {
    useApplicationStore.setState({ applications: [PENDING_APP] });
    createRouteLoader();
    expect(redirect).toHaveBeenCalledWith(RoutePaths.home);
  });

  it('redirects to home when generation is in progress (pending app exists)', () => {
    // A pending app is added synchronously in onMutate before the fetch starts,
    // so this case is equivalent to the previous test.
    useApplicationStore.setState({ applications: [PENDING_APP] });
    createRouteLoader();
    expect(redirect).toHaveBeenCalledWith(RoutePaths.home);
  });

  it('does not redirect when all applications are completed', () => {
    useApplicationStore.setState({ applications: [COMPLETED_APP] });
    expect(createRouteLoader()).toBeNull();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('redirects when at least one application is pending among multiple', () => {
    useApplicationStore.setState({
      applications: [COMPLETED_APP, PENDING_APP],
    });
    createRouteLoader();
    expect(redirect).toHaveBeenCalledTimes(1);
    expect(redirect).toHaveBeenCalledWith(RoutePaths.home);
  });
});
