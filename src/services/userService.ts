
'use client';

import type { User } from '@/contexts/AuthContext';

const USERS_STORAGE_KEY = 'darkfire_users';
const ADMIN_EMAIL = 'admin@darkfire.com';

function getStoredUsers(): User[] {
  if (typeof window === 'undefined') {
    return [];
  }
  const stored = localStorage.getItem(USERS_STORAGE_KEY);
  try {
    if (stored) {
      const users = JSON.parse(stored);
      // Ensure it's an array before returning
      return Array.isArray(users) ? users : [];
    }
  } catch (e) {
    console.error("Failed to parse users from localStorage", e);
    return [];
  }
  return [];
}

function setStoredUsers(users: User[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

export function getUsers(): User[] {
  return getStoredUsers();
}

export function addUser(user: User): void {
  if (user.email === ADMIN_EMAIL) return;

  const users = getStoredUsers();
  const userExists = users.some(u => u.email === user.email);
  
  if (!userExists) {
    const newUsers = [...users, user];
    setStoredUsers(newUsers);
  }
}

export function deleteUser(email: string): void {
  const users = getStoredUsers();
  const newUsers = users.filter(u => u.email !== email);
  setStoredUsers(newUsers);
}
