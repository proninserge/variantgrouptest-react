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
    it('rejects when shorter than 3 characters', () => {
      const result = parse({ jobTitle: 'AB' });
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.issues[0]?.message).toContain('required');
    });

    it('accepts exactly 3 characters', () => {
      expect(parse({ jobTitle: 'Dev' }).success).toBe(true);
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
    it('rejects when shorter than 5 characters', () => {
      expect(parse({ companyName: 'Acme' }).success).toBe(false);
    });

    it('accepts exactly 5 characters', () => {
      expect(parse({ companyName: 'Acme2' }).success).toBe(true);
    });

    it('rejects cyrillic characters', () => {
      expect(parse({ companyName: 'Яндекс' }).success).toBe(false);
    });
  });

  describe('skills', () => {
    it('rejects when shorter than 50 characters', () => {
      expect(parse({ skills: 'TypeScript React' }).success).toBe(false);
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
    it('rejects when shorter than 50 characters', () => {
      expect(parse({ additionalDetails: 'Too short.' }).success).toBe(false);
    });

    it('rejects when longer than 1200 characters', () => {
      expect(parse({ additionalDetails: 'a '.repeat(601) }).success).toBe(false);
    });

    it('accepts text at exactly 50 characters', () => {
      // 50 lowercase Latin letters — hits the minimum boundary exactly
      expect(parse({ additionalDetails: 'a'.repeat(50) }).success).toBe(true);
    });
  });
});
