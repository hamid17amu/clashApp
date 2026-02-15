import { z } from 'zod';

export const clashSchema = z.object({
    title: z.string({ message: 'Title is required' }).min(5, { message: 'Title must be 5 character long.' }),
    description: z
        .string({ message: 'Description is required' })
        .min(6, { message: 'Description must be 6 character long.' })
        .max(1000, { message: 'Description must have less than 1000 character long.' }),
    expire_at: z.string({ message: 'Expiry date is required' }).min(5, { message: 'Enter a valid date' }),
    image: z.string().optional(),
});
