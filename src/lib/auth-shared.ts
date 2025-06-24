
import { z } from 'zod';

export const USER_COOKIE = 'darkfire_user_session';

// --- Zod Schemas ---
export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  password: z.string(), // This will be the hashed password
  role: z.enum(['admin', 'user']),
});

export const CreateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email().refine(email => email.endsWith('@gmail.com'), {
    message: 'Only @gmail.com addresses are allowed',
  }),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .refine(password => /[a-z]/.test(password), { message: 'Password must contain a lowercase letter' })
    .refine(password => /[A-Z]/.test(password), { message: 'Password must contain an uppercase letter' })
    .refine(password => /\d/.test(password), { message: 'Password must contain a number' })
    .refine(password => /[\W_]/.test(password), { message: 'Password must contain a special character' }),
});

// --- Type Definitions ---
export type User = z.infer<typeof UserSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type PublicUser = Omit<User, 'password'>;
