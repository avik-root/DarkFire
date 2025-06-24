
"use server";

import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { getUsers as getUsersFromFile, deleteUserByEmail } from "@/lib/auth";
import type { UpdateAdminSchema } from "@/lib/auth-shared";
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
  github?: string;
  linkedin?: string;
  email?: string;
};


async function readTeamData(): Promise<TeamMember[]> {
  try {
    const data = await fs.readFile(teamFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
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

const TeamMemberUpdateSchema = z.object({
  handle: z.string(),
  name: z.string().min(1, 'Name cannot be empty.'),
  role: z.string().min(1, 'Role cannot be empty.'),
  bio: z.string().min(10, 'Bio must be at least 10 characters.'),
  avatar: z.string().optional(), // Data URL for new avatar
  github: z.string().url().or(z.literal('')).optional(),
  linkedin: z.string().url().or(z.literal('')).optional(),
  email: z.string().email().or(z.literal('')).optional(),
});
export type TeamMemberUpdateInput = z.infer<typeof TeamMemberUpdateSchema>;


export async function updateTeamMemberAction(data: TeamMemberUpdateInput) {
    try {
        const result = TeamMemberUpdateSchema.safeParse(data);
        if (!result.success) {
            return { success: false, error: result.error.errors.map(e => e.message).join(', ') };
        }

        const team = await readTeamData();
        const memberIndex = team.findIndex(m => m.handle === data.handle);

        if (memberIndex === -1) {
            return { success: false, error: 'Team member not found.' };
        }
        
        const memberToUpdate = team[memberIndex];

        memberToUpdate.name = data.name;
        memberToUpdate.role = data.role;
        memberToUpdate.bio = data.bio;
        memberToUpdate.github = data.github;
        memberToUpdate.linkedin = data.linkedin;
        memberToUpdate.email = data.email;

        if (data.avatar && data.avatar.startsWith('data:image/')) {
            memberToUpdate.avatar = data.avatar;
        }

        team[memberIndex] = memberToUpdate;
        await writeTeamData(team);

        return { success: true, member: team[memberIndex], message: 'Team member updated successfully.' };
    } catch (error: any) {
        return { success: false, error: `Failed to update team member: ${error.message}` };
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
        if (data.password) {
            // Zod schema ensures currentPassword is provided if new password is set.
            // We just need to verify it's correct.
            const isPasswordValid = await bcrypt.compare(data.currentPassword!, adminToUpdate.password);
            if (!isPasswordValid) {
                return { success: false, error: "The current password you entered is incorrect." };
            }
            
            // Zod schema ensures passwords match. Hash the new password.
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

// --- Analytics Actions ---
const analyticsFilePath = path.join(dataDir, 'analytics.json');

type AnalyticsData = {
    payloadsGenerated: number;
    successfulGenerations: number;
    failedGenerations: number;
    generationHistory: { month: string; generated: number }[];
};

async function readAnalyticsData(): Promise<AnalyticsData> {
    const defaultData: AnalyticsData = {
        payloadsGenerated: 0,
        successfulGenerations: 0,
        failedGenerations: 0,
        generationHistory: [
            { "month": "Jan", "generated": 0 }, { "month": "Feb", "generated": 0 },
            { "month": "Mar", "generated": 0 }, { "month": "Apr", "generated": 0 },
            { "month": "May", "generated": 0 }, { "month": "Jun", "generated": 0 },
            { "month": "Jul", "generated": 0 }, { "month": "Aug", "generated": 0 },
            { "month": "Sep", "generated": 0 }, { "month": "Oct", "generated": 0 },
            { "month": "Nov", "generated": 0 }, { "month": "Dec", "generated": 0 }
        ]
    };
    try {
        const data = await fs.readFile(analyticsFilePath, 'utf-8');
        // Merge with defaults to ensure all keys are present
        return { ...defaultData, ...JSON.parse(data) };
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            await fs.writeFile(analyticsFilePath, JSON.stringify(defaultData, null, 2), 'utf-8');
            return defaultData;
        }
        console.error("Error reading analytics data file:", error);
        return defaultData; // Fallback to default
    }
}

export async function getAnalyticsDataAction() {
    try {
        const data = await readAnalyticsData();
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
