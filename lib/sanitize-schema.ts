import { defaultSchema } from 'rehype-sanitize';

export const blogSanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames || []),
    'transcript-viewer',
    'poll',
    'plan-comparison',
    'details',
    'summary',
  ],
  attributes: {
    ...defaultSchema.attributes,
    'transcript-viewer': ['phase'],
    poll: ['pollId', 'question', 'options'],
    'plan-comparison': [],
    details: ['open'],
    summary: [],
    '*': [...(defaultSchema.attributes?.['*'] || []), 'data*', 'className'],
  },
};
