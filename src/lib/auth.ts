
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
  // Only return regular users for management purposes in the dashboard.
  const regularUsers = await readUserFile(regularUsersFilePath);
  return regularUsers.map(({ password, ...user }) => user);
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
    codeGenerationEnabled: role === 'admin',
    formSubmitted: role === 'admin',
    credits: role === 'admin' ? 9999 : 2,
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

export async function updateUserFormStatus(email: string): Promise<User> {
    const users = await readUserFile(regularUsersFilePath);
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex === -1) {
        throw new Error('User not found');
    }
    users[userIndex].formSubmitted = true;
    await writeUserFile(regularUsersFilePath, users);
    return users[userIndex];
}

export async function approveUserByEmail(email: string): Promise<void> {
    const users = await readUserFile(regularUsersFilePath);
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex > -1) {
        users[userIndex].codeGenerationEnabled = true;
        await writeUserFile(regularUsersFilePath, users);
    } else {
        console.warn(`Attempted to approve non-existent user: ${email}`);
        throw new Error('User not found.');
    }
}

export async function updateUserCodeGenerationByEmail(email: string, enabled: boolean): Promise<void> {
  const users = await readUserFile(regularUsersFilePath);
  const userIndex = users.findIndex(u => u.email === email);
  if (userIndex > -1) {
    users[userIndex].codeGenerationEnabled = enabled;
    await writeUserFile(regularUsersFilePath, users);
  } else {
    throw new Error('User not found.');
  }
}

export async function updateUserCreditsByEmail(email: string, credits: number): Promise<void> {
    const users = await readUserFile(regularUsersFilePath);
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex > -1) {
        users[userIndex].credits = credits;
        await writeUserFile(regularUsersFilePath, users);
    } else {
        throw new Error('User not found.');
    }
}

export async function decrementUserCredit(email: string): Promise<User | null> {
    // Only applies to regular users
    const users = await readUserFile(regularUsersFilePath);
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex > -1) {
        const user = users[userIndex];
        if (user.credits !== undefined && user.credits > 0) {
            user.credits -= 1;
            users[userIndex] = user;
            await writeUserFile(regularUsersFilePath, users);
            return user;
        }
        return null; // Not enough credits
    }
    return null; // User not found
}
