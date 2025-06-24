
'use server';

import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';
import type { User, CreateUserInput, PublicUser } from './auth-shared';

const usersFilePath = path.join(process.cwd(), 'src', 'data', 'users.json');

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
