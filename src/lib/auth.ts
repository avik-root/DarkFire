
'use server';

import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcrypt';
import { z } from 'zod';

export const USER_COOKIE = 'darkfire_user_session';
const usersFilePath = path.join(process.cwd(), 'src', 'data', 'users.json');

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


// --- Helper Functions ---
async function readUsers(): Promise<User[]> {
  try {
    const data = await fs.readFile(usersFilePath, 'utf-8');
    if (!data) return [];
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, so we start with an empty array
      return [];
    }
    console.error('Error reading users file:', error);
    throw new Error('Could not read user data.');
  }
}

async function writeUsers(users: User[]): Promise<void> {
  try {
    await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing users file:', error);
    throw new Error('Could not save user data.');
  }
}

// --- Public API ---
export async function getUsers(): Promise<PublicUser[]> {
  const users = await readUsers();
  return users.map(({ password, ...user }) => user);
}

export async function addUser(data: CreateUserInput): Promise<PublicUser> {
  const users = await readUsers();

  const userExists = users.some(user => user.email === data.email);
  if (userExists) {
    throw new Error('An account with this email already exists.');
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const role = users.length === 0 ? 'admin' : 'user';

  const newUser: User = {
    id: new Date().toISOString() + Math.random(),
    name: data.name,
    email: data.email,
    password: hashedPassword,
    role,
  };

  await writeUsers([...users, newUser]);

  const { password, ...publicUser } = newUser;
  return publicUser;
}

export async function verifyUser(email: string, pass: string): Promise<PublicUser | null> {
    const users = await readUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
        return null;
    }

    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) {
        return null;
    }

    const { password, ...publicUser } = user;
    return publicUser;
}


export async function deleteUserByEmail(email: string): Promise<void> {
  let users = await readUsers();
  const initialCount = users.length;
  users = users.filter(user => user.email !== email);

  if (users.length === initialCount) {
    // Optional: throw an error if the user wasn't found
    // throw new Error('User not found.');
    return; // Or just return silently
  }

  await writeUsers(users);
}
