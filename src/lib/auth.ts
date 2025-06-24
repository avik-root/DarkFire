
'use server';

import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';
import type { User, CreateUserInput, PublicUser } from './auth-shared';

const dataDir = path.join(process.cwd(), 'src', 'data');
const regularUsersFilePath = path.join(dataDir, 'users.json');
const adminUsersFilePath = path.join(dataDir, 'admin.json');


// --- Helper Functions ---
async function readUserFile(filePath: string): Promise<User[]> {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    if (!data) return [];
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, so we start with an empty array
      return [];
    }
    console.error(`Error reading users file at ${filePath}:`, error);
    throw new Error('Could not read user data.');
  }
}

async function writeUserFile(filePath: string, users: User[]): Promise<void> {
  try {
    await fs.writeFile(filePath, JSON.stringify(users, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing users file to ${filePath}:`, error);
    throw new Error('Could not save user data.');
  }
}

// --- Public API ---
export async function getUsers(): Promise<PublicUser[]> {
  const regularUsers = await readUserFile(regularUsersFilePath);
  const adminUsers = await readUserFile(adminUsersFilePath);
  const allUsers = [...adminUsers, ...regularUsers];
  return allUsers.map(({ password, ...user }) => user);
}

export async function addUser(data: CreateUserInput): Promise<PublicUser> {
  const regularUsers = await readUserFile(regularUsersFilePath);
  const adminUsers = await readUserFile(adminUsersFilePath);
  const allUsers = [...adminUsers, ...regularUsers];

  const userExists = allUsers.some(user => user.email === data.email);
  if (userExists) {
    throw new Error('An account with this email already exists.');
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);
  
  const isFirstUser = allUsers.length === 0;
  const role = isFirstUser ? 'admin' : 'user';

  const newUser: User = {
    id: new Date().toISOString() + Math.random(),
    name: data.name,
    email: data.email,
    password: hashedPassword,
    role,
  };
  
  if (isFirstUser) {
    await writeUserFile(adminUsersFilePath, [...adminUsers, newUser]);
  } else {
    await writeUserFile(regularUsersFilePath, [...regularUsers, newUser]);
  }

  const { password, ...publicUser } = newUser;
  return publicUser;
}

export async function verifyUser(email: string, pass: string): Promise<PublicUser | null> {
    const regularUsers = await readUserFile(regularUsersFilePath);
    const adminUsers = await readUserFile(adminUsersFilePath);
    
    // Check admins first, then regular users
    const user = adminUsers.find(u => u.email === email) || regularUsers.find(u => u.email === email);

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
  // From the admin dashboard, only regular users can be deleted.
  let users = await readUserFile(regularUsersFilePath);
  const initialCount = users.length;
  users = users.filter(user => user.email !== email);

  if (users.length === initialCount) {
    // User was not found in the regular users file.
    // We don't check the admin file because the UI prevents this action.
    return;
  }

  await writeUserFile(regularUsersFilePath, users);
}
