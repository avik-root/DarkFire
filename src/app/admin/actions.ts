
"use server";

import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { getUsers as getUsersFromFile, deleteUserByEmail, updateUserCodeGenerationByEmail, addActivationKeyByEmail, deleteActivationKeyForEmail, updateUserTwoFactor } from "@/lib/auth";
import type { UpdateAdminSchema } from "@/lib/auth-shared";
import type { User, PublicUser } from '@/lib/auth-shared';

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

const ManagePermissionSchema = z.object({
    email: z.string().email(),
    action: z.enum(['enable', 'disable']),
    secretCode: z.string().min(1, 'Secret code is required.'),
});

export async function manageUserPermissionAction(data: unknown) {
    const result = ManagePermissionSchema.safeParse(data);
    if (!result.success) {
        const firstError = result.error.errors[0]?.message || "Invalid data provided.";
        return { success: false, error: firstError };
    }
    
    const { email, action, secretCode } = result.data;
    const codesFilePath = path.join(dataDir, 'secret_codes.json');
    
    try {
        const codesData = await fs.readFile(codesFilePath, 'utf-8');
        const codes = JSON.parse(codesData);

        if (action === 'enable' && secretCode !== codes.enableCode) {
            return { success: false, error: "Invalid secret code for enabling." };
        }

        if (action === 'disable' && secretCode !== codes.disableCode) {
            return { success: false, error: "Invalid secret code for disabling." };
        }
    
        await updateUserCodeGenerationByEmail(email, action === 'enable');
        const message = `User ${email} code generation has been ${action}d.`;
        return { success: true, message };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

const AddActivationKeySchema = z.object({
    email: z.string().email(),
    activationKey: z.string().min(10, "Activation key must be at least 10 characters."),
    credits: z.number().int().min(1, "Credits must be at least 1."),
});

export async function addActivationKeyAction(data: unknown): Promise<{ success: boolean; message?: string; error?: string; user?: PublicUser }> {
    const result = AddActivationKeySchema.safeParse(data);
    if (!result.success) {
        return { success: false, error: result.error.errors.map(e => e.message).join(', ') };
    }
    
    try {
        const updatedUser = await addActivationKeyByEmail(result.data.email, result.data.activationKey, result.data.credits);
        const { password, ...publicUser } = updatedUser;
        return { success: true, message: `Activation key for ${result.data.email} has been added.`, user: publicUser };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

const DeleteActivationKeySchema = z.object({
  email: z.string().email(),
  key: z.string(),
});

export async function deleteActivationKeyAction(data: unknown): Promise<{success: boolean, message?: string, error?: string, user?: PublicUser}> {
  const result = DeleteActivationKeySchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: "Invalid data provided for key deletion." };
  }

  try {
    const updatedUser = await deleteActivationKeyForEmail(result.data.email, result.data.key);
    const { password, ...publicUser } = updatedUser;
    return { success: true, message: "Activation key deleted successfully.", user: publicUser };
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

const AdminTwoFactorSchema = z.object({
    email: z.string().email(),
    enabled: z.boolean(),
    pin: z.string().optional(),
    password: z.string().min(1, "Password is required to change 2FA settings."),
}).refine(data => {
    if (data.enabled) {
        return data.pin && data.pin.length === 6 && /^\d+$/.test(data.pin);
    }
    return true;
}, {
    message: "A 6-digit PIN is required to enable.",
    path: ["pin"],
});

export async function updateAdminTwoFactorAction(data: unknown): Promise<{ success: boolean; error?: string; message?: string, user?: PublicUser }> {
    const result = AdminTwoFactorSchema.safeParse(data);
    if (!result.success) {
        return { success: false, error: result.error.errors.map(e => e.message).join(', ') };
    }

    const { email, enabled, pin, password: currentPassword } = result.data;
    
    try {
        const admins = JSON.parse(await fs.readFile(adminFilePath, 'utf-8')) as User[];
        const adminIndex = admins.findIndex(admin => admin.email === email);
        if (adminIndex === -1) {
            return { success: false, error: "Admin user not found." };
        }

        const admin = admins[adminIndex];
        const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
        if (!isPasswordValid) {
            return { success: false, error: "Incorrect password." };
        }

        const updatedUser = await updateUserTwoFactor(email, pin || null, enabled);
        const { password, ...publicUser } = updatedUser;
        const message = enabled ? "2-step verification enabled." : "2-step verification disabled.";
        return { success: true, user: publicUser, message };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}


// --- Analytics Actions ---
const analyticsFilePath = path.join(dataDir, 'analytics.json');

type AnalyticsData = {
    payloadsGenerated: number;
    successfulGenerations: number;
    failedGenerations: number;
    generationHistory: { month: string; generated: number }[];
    languageCounts: { [key: string]: number };
    payloadTypeCounts: { [key: string]: number };
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
        ],
        languageCounts: {},
        payloadTypeCounts: {}
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

// --- Activity Log Action ---
const activityLogFilePath = path.join(dataDir, 'activity-log.json');

export type ActivityLogEntry = {
    timestamp: string;
    status: 'success' | 'failure';
    language: string;
    payloadType: string;
};

async function readActivityLog(): Promise<ActivityLogEntry[]> {
    try {
        const data = await fs.readFile(activityLogFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return []; // File doesn't exist yet, return empty array
        }
        console.error("Error reading activity log file:", error);
        return [];
    }
}

export async function getActivityLogAction() {
    try {
        const log = await readActivityLog();
        return { success: true, log };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- Logo Management Action ---
export async function uploadLogoAction(formData: FormData): Promise<{ success: boolean; error?: string; message?: string }> {
  const file = formData.get('logo') as File;

  if (!file || file.size === 0) {
    return { success: false, error: 'No file was selected for upload.' };
  }

  if (file.size > 2 * 1024 * 1024) {
    return { success: false, error: 'File is too large. Maximum size is 2MB.' };
  }

  const allowedTypes = ['image/png', 'image/jpeg'];
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: 'Only .png and .jpg files are allowed.' };
  }

  const extension = file.type.split('/')[1];
  const filename = `logo.${extension}`;
  const publicDir = path.join(process.cwd(), 'public');
  const logoPath = path.join(publicDir, filename);
  const logoInfoPath = path.join(publicDir, 'logo-info.json');

  try {
    await fs.mkdir(publicDir, { recursive: true });

    // Clean up old logo files to ensure only one exists
    const filesInPublic = await fs.readdir(publicDir);
    for (const f of filesInPublic) {
      if (f.startsWith('logo.')) {
        await fs.unlink(path.join(publicDir, f));
      }
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(logoPath, buffer);

    const logoInfo = {
      url: `/${filename}`,
      timestamp: Date.now(),
    };
    await fs.writeFile(logoInfoPath, JSON.stringify(logoInfo));

    return { success: true, message: 'Logo uploaded successfully!' };
  } catch (error: any) {
    console.error('Logo upload error:', error);
    return { success: false, error: 'Server error during logo upload.' };
  }
}
