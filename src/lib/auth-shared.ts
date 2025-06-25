
import { z } from 'zod';

export const USER_COOKIE = 'darkfire_user_session';

// --- Zod Schemas ---
export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  password: z.string(), // This will be the hashed password
  role: z.enum(['admin', 'user']),
  codeGenerationEnabled: z.boolean().optional(),
  formSubmitted: z.boolean().optional(),
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

export const UpdateAdminSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  currentPassword: z.string().optional(),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
}).superRefine((data, ctx) => {
  // If user is trying to set a new password (by typing in new password or confirm password fields)
  if (data.password || data.confirmPassword) {
    
    // Require current password
    if (!data.currentPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['currentPassword'],
        message: 'Current password is required to set a new one.',
      });
    }

    // Require new password and validate its strength
    if (!data.password) {
        ctx.addIssue({
            code: 'custom',
            path: ['password'],
            message: 'Please enter a new password.',
        });
    } else {
        if (data.password.length < 8) {
            ctx.addIssue({ code: 'custom', path: ['password'], message: 'New password must be at least 8 characters.' });
        }
        if (!/[a-z]/.test(data.password)) {
            ctx.addIssue({ code: 'custom', path: ['password'], message: 'Password must contain a lowercase letter.' });
        }
        if (!/[A-Z]/.test(data.password)) {
            ctx.addIssue({ code: 'custom', path: ['password'], message: 'Password must contain an uppercase letter.' });
        }
        if (!/\d/.test(data.password)) {
            ctx.addIssue({ code: 'custom', path: ['password'], message: 'Password must contain a number.' });
        }
        if (!/[\W_]/.test(data.password)) {
            ctx.addIssue({ code: 'custom', path: ['password'], message: 'Password must contain a special character.' });
        }
    }
    
    // Require passwords to match
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'The new passwords do not match.',
      });
    }
  }
});


// --- Type Definitions ---
export type User = z.infer<typeof UserSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type PublicUser = Omit<User, 'password'>;
