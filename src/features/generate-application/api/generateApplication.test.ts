import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { generateApplication } from './generateApplication';

const FORM_VALUES = {
  jobTitle: 'Frontend Engineer',
  companyName: 'Acme Corp',
  skills: 'TypeScript React Node.js GraphQL REST APIs Docker',
  additionalDetails: 'Experienced developer with a passion for clean code.',
};

describe('generateApplication', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns generated content on success', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ content: 'Dear hiring manager...' }),
    } as Response);

    await expect(generateApplication(FORM_VALUES, new AbortController().signal)).resolves.toBe(
      'Dear hiring manager...',
    );

    expect(vi.mocked(fetch)).toHaveBeenCalledWith('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(FORM_VALUES),
      signal: expect.any(AbortSignal) as AbortSignal,
    });
  });

  it('throws API error message when the response is not ok', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 502,
      json: () => Promise.resolve({ error: 'Failed to generate application, please try again' }),
    } as Response);

    await expect(generateApplication(FORM_VALUES, new AbortController().signal)).rejects.toThrow(
      'Failed to generate application, please try again',
    );
  });

  it('throws a fallback message when the error body is missing', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    } as Response);

    await expect(generateApplication(FORM_VALUES, new AbortController().signal)).rejects.toThrow(
      'Request failed: 500',
    );
  });

  it('propagates network failures', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network timeout'));

    await expect(generateApplication(FORM_VALUES, new AbortController().signal)).rejects.toThrow(
      'Network timeout',
    );
  });
});
