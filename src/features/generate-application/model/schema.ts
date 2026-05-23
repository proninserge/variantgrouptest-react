import { z } from 'zod';

const BASIC_CHARS = /^[a-zA-Z0-9 ]+$/;
const EXTENDED_CHARS = /^[a-zA-Z0-9 .,\-:;]+$/;

export const generateApplicationSchema = z.object({
  jobTitle: z
    .string()
    .trim()
    .min(1, 'Job title is required')
    .max(50, 'Job title must be less than 50 characters')
    .regex(BASIC_CHARS, 'Only Latin letters, digits and spaces are allowed'),
  companyName: z
    .string()
    .trim()
    .min(1, 'Company is required')
    .max(50, 'Company name must be less than 50 characters')
    .regex(BASIC_CHARS, 'Only Latin letters, digits and spaces are allowed'),
  skills: z
    .string()
    .trim()
    .min(1, 'Skills are required')
    .max(100, 'Skills must be less than 100 characters')
    .regex(EXTENDED_CHARS, 'Only Latin letters, digits, spaces and . , - : ; are allowed'),
  additionalDetails: z
    .string()
    .trim()
    .min(1, 'Additional details are required')
    .max(1200, 'Max 1200 characters')
    .regex(EXTENDED_CHARS, 'Only Latin letters, digits, spaces and . , - : ; are allowed'),
});

export type GenerateApplicationSchema = z.infer<typeof generateApplicationSchema>;
