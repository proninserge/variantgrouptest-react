import { describe, expect, it } from 'vitest';

import { generateApplicationSchema } from './schema';

const VALID = {
  jobTitle: 'Software Engineer',
  companyName: 'Acme Corp',
  skills: 'TypeScript React Node.js GraphQL REST APIs Docker Kubernetes CI CD',
  additionalDetails:
    'I have 5 years of experience building scalable web applications. I am passionate about clean code and best practices in software engineering.',
};

function parse(overrides: Partial<typeof VALID>) {
  return generateApplicationSchema.safeParse({ ...VALID, ...overrides });
}

describe('generateApplicationSchema', () => {
  it('accepts a fully valid payload', () => {
    expect(parse({}).success).toBe(true);
  });

  describe('jobTitle', () => {
    it('rejects when empty', () => {
      const result = parse({ jobTitle: '' });
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.issues[0]?.message).toContain('required');
    });

    it('rejects whitespace-only value', () => {
      expect(parse({ jobTitle: '   ' }).success).toBe(false);
    });

    it('accepts a single character', () => {
      expect(parse({ jobTitle: 'A' }).success).toBe(true);
    });

    it('accepts short values', () => {
      expect(parse({ jobTitle: 'AB' }).success).toBe(true);
    });

    it('rejects when longer than 50 characters', () => {
      expect(parse({ jobTitle: 'A'.repeat(51) }).success).toBe(false);
    });

    it('accepts exactly 50 characters', () => {
      expect(parse({ jobTitle: 'A'.repeat(50) }).success).toBe(true);
    });

    it('rejects cyrillic characters', () => {
      const result = parse({ jobTitle: 'Разработчик' });
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.issues[0]?.message).toContain('Latin');
    });

    it('rejects special characters like @, !, #', () => {
      expect(parse({ jobTitle: 'Dev@Corp!' }).success).toBe(false);
    });

    it('trims surrounding whitespace before validation', () => {
      expect(parse({ jobTitle: '  Dev  ' }).success).toBe(true);
    });
  });

  describe('companyName', () => {
    it('rejects when empty', () => {
      const result = parse({ companyName: '' });
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.issues[0]?.message).toContain('required');
    });

    it('accepts short names', () => {
      expect(parse({ companyName: 'Acme' }).success).toBe(true);
    });

    it('rejects cyrillic characters', () => {
      expect(parse({ companyName: 'Яндекс' }).success).toBe(false);
    });
  });

  describe('skills', () => {
    it('rejects when empty', () => {
      const result = parse({ skills: '' });
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.issues[0]?.message).toContain('required');
    });

    it('accepts short values', () => {
      expect(parse({ skills: 'TypeScript React' }).success).toBe(true);
    });

    it('rejects when longer than 100 characters', () => {
      expect(parse({ skills: 'a '.repeat(51) }).success).toBe(false);
    });

    it('allows punctuation: . , - : ;', () => {
      const value = 'TypeScript, React.js; Node-js: REST APIs - GraphQL Docker Kubernetes CI CD';
      expect(parse({ skills: value }).success).toBe(true);
    });

    it('rejects characters outside the allowed set (e.g. @, $)', () => {
      const value = 'TypeScript$ React@ Node# GraphQL Docker Kubernetes CI CD REST';
      expect(parse({ skills: value }).success).toBe(false);
    });

    it('rejects cyrillic characters', () => {
      const value = 'TypeScript Реакт Node.js GraphQL REST APIs Docker Kubernetes CI';
      expect(parse({ skills: value }).success).toBe(false);
    });
  });

  describe('additionalDetails', () => {
    it('rejects when empty', () => {
      const result = parse({ additionalDetails: '' });
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.issues[0]?.message).toContain('required');
    });

    it('accepts short values', () => {
      expect(parse({ additionalDetails: 'Too short.' }).success).toBe(true);
    });

    it('rejects when longer than 1200 characters', () => {
      expect(parse({ additionalDetails: 'a '.repeat(601) }).success).toBe(false);
    });

    it('accepts a single character', () => {
      expect(parse({ additionalDetails: 'a' }).success).toBe(true);
    });
  });
});
