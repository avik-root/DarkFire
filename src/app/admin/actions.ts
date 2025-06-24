
"use server";

import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { getUsers as getUsersFromFile, deleteUserByEmail } from "@/lib/auth";
import type { PublicUser, UpdateAdminSchema } from "@/lib/auth-shared";
import type { User } from '@/lib/auth-shared';

const dataDir = path.join(process.cwd(), 'src', 'data');

// --- User Management Actions ---
export async function getUsersAction() {
    try {
        const users = await getUsersFromFile();
        return { success: true, users };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteUserAction(email: string) {
    try {
        await deleteUserByEmail(email);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- Team Management Actions ---
const teamFilePath = path.join(dataDir, 'team.json');

type TeamMember = {
  name: string;
  role: string;
  avatar: string;
  handle: string;
  bio: string;
  hint: string;
};

async function readTeamData(): Promise<TeamMember[]> {
  try {
    const data = await fs.readFile(teamFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty array.
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    console.error("Error reading team data file:", error);
    return [];
  }
}

async function writeTeamData(data: TeamMember[]): Promise<void> {
  await fs.writeFile(teamFilePath, JSON.stringify(data, null, 2), 'utf-8');
}


export async function getTeamMembersAction() {
    try {
        const team = await readTeamData();
        return { success: true, team };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateTeamMemberAction(handle: string, avatarDataUrl: string) {
    try {
        if (!avatarDataUrl.startsWith('data:image/')) {
            return { success: false, error: 'Invalid image data provided.' };
        }

        const team = await readTeamData();
        const memberIndex = team.findIndex(m => m.handle === handle);

        if (memberIndex === -1) {
            return { success: false, error: 'Team member not found.' };
        }

        team[memberIndex].avatar = avatarDataUrl;
        await writeTeamData(team);

        return { success: true, member: team[memberIndex] };
    } catch (error: any) {
        return { success: false, error: `Failed to update avatar: ${error.message}` };
    }
}

// --- Settings Actions ---
const settingsFilePath = path.join(dataDir, 'settings.json');
const usersFilePath = path.join(dataDir, 'users.json');
const adminFilePath = path.join(dataDir, 'admin.json');

type AppSettings = {
    maintenanceMode: boolean;
    allowRegistrations: boolean;
    apiKey: string;
};

async function readSettingsData(): Promise<AppSettings> {
    try {
        const data = await fs.readFile(settingsFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        // Fallback to default settings if file doesn't exist or is invalid
        return { maintenanceMode: false, allowRegistrations: true, apiKey: "" };
    }
}

async function writeSettingsData(data: AppSettings): Promise<void> {
    await fs.writeFile(settingsFilePath, JSON.stringify(data, null, 2), 'utf-8');
}


export async function getSettingsAction() {
    try {
        const settings = await readSettingsData();
        return { success: true, settings };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

const SettingsSchema = z.object({
    maintenanceMode: z.boolean(),
    allowRegistrations: z.boolean(),
    apiKey: z.string().optional(),
});

export async function saveSettingsAction(data: unknown) {
    const result = SettingsSchema.safeParse(data);
    if (!result.success) {
        return { success: false, error: "Invalid data provided." };
    }
    
    try {
        await writeSettingsData(result.data as AppSettings);
        return { success: true, message: "Settings saved successfully!" };
    } catch (error: any) {
        return { success: false, error: "Failed to save settings." };
    }
}

export async function resetApplicationDataAction() {
    try {
        await fs.writeFile(usersFilePath, JSON.stringify([], null, 2), 'utf-8');
        return { success: true, message: "Non-admin user data has been cleared." };
    } catch (error: any) {
        return { success: false, error: "Failed to reset application data." };
    }
}

export async function updateAdminProfileAction(userId: string, data: z.infer<typeof UpdateAdminSchema>) {
    try {
        const admins = JSON.parse(await fs.readFile(adminFilePath, 'utf-8')) as User[];
        const adminIndex = admins.findIndex(admin => admin.id === userId);

        if (adminIndex === -1) {
            return { success: false, error: "Admin user not found." };
        }

        const adminToUpdate = admins[adminIndex];
        
        // Update name and email
        adminToUpdate.name = data.name;
        adminToUpdate.email = data.email;

        // Update password if a new one is provided
        if (data.password && data.password.length > 0) {
            adminToUpdate.password = await bcrypt.hash(data.password, 10);
        }

        admins[adminIndex] = adminToUpdate;
        await fs.writeFile(adminFilePath, JSON.stringify(admins, null, 2), 'utf-8');
        
        const { password, ...publicUser } = adminToUpdate;

        return { success: true, user: publicUser, message: "Admin profile updated successfully." };

    } catch (error: any) {
        return { success: false, error: "Failed to update admin profile." };
    }
}
