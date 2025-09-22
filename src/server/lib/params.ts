import { z } from 'zod';

export const OrgSlugSchema = z.object({ org: z.string().min(1) });
