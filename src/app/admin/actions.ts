
"use server";

import { getUsers as getUsersFromFile, deleteUserByEmail } from "@/lib/auth";
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';

// User Management Actions
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


// Team Management Actions
const teamFilePath = path.join(process.cwd(), 'src', 'data', 'team.json');

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

// Settings Actions
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

    // In a real application, you would save these settings to a database
    // or a secure configuration store. For this prototype, we'll just
    // simulate success without persisting the data.
    console.log("Simulating saving settings:", result.data);

    return { success: true, message: "Settings saved successfully!" };
}
