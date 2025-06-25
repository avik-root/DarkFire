
"use server";

import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import type { PublicUser } from '@/lib/auth-shared';
import { updateUserFormStatus } from '@/lib/auth';

const dataDir = path.join(process.cwd(), 'src', 'data');
const formFilePath = path.join(dataDir, 'form.json');

type RequestEntry = {
    email: string;
    fullName: string;
    occupation: string;
    reason: string;
    status: 'pending' | 'approved';
    timestamp: string;
};

async function readRequestsFile(): Promise<RequestEntry[]> {
    try {
        const data = await fs.readFile(formFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            await fs.writeFile(formFilePath, JSON.stringify([], null, 2), 'utf-8');
            return [];
        }
        console.error("Error reading form data file:", error);
        return [];
    }
}

async function writeRequestsFile(data: RequestEntry[]): Promise<void> {
    await fs.writeFile(formFilePath, JSON.stringify(data, null, 2), 'utf-8');
}


const RequestFormSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters."),
  occupation: z.string().min(3, "Occupation must be at least 3 characters."),
  reason: z.string().min(20, "Reason must be at least 20 characters.").max(500, "Reason cannot exceed 500 characters."),
  email: z.string().email(),
});
export type RequestFormInput = z.infer<typeof RequestFormSchema>;


export async function submitRequestAction(data: RequestFormInput): Promise<{ success: boolean; message: string; user?: PublicUser }> {
    const result = RequestFormSchema.safeParse(data);
    if (!result.success) {
        return { success: false, message: result.error.errors.map(e => e.message).join(', ') };
    }
    
    try {
        const requests = await readRequestsFile();
        
        // Check if a request for this email already exists
        const existingRequest = requests.find(r => r.email === data.email);
        if (existingRequest) {
            return { success: false, message: "An access request for this email has already been submitted." };
        }

        const newRequest: RequestEntry = {
            ...data,
            status: 'pending',
            timestamp: new Date().toISOString()
        };
        
        requests.push(newRequest);
        await writeRequestsFile(requests);
        
        // Update user's profile to mark form as submitted
        const updatedUser = await updateUserFormStatus(data.email);
        const { password, ...publicUser } = updatedUser;

        return { success: true, message: "Your request has been submitted successfully!", user: publicUser };

    } catch (error: any) {
        return { success: false, message: `Failed to submit request: ${error.message}` };
    }
}
