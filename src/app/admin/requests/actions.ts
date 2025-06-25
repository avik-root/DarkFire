
"use server";

import fs from 'fs/promises';
import path from 'path';
import { approveUserByEmail } from '@/lib/auth';

const dataDir = path.join(process.cwd(), 'src', 'data');
const formFilePath = path.join(dataDir, 'form.json');

export type RequestEntry = {
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
            return [];
        }
        console.error("Error reading form data file:", error);
        return [];
    }
}

async function writeRequestsFile(data: RequestEntry[]): Promise<void> {
    await fs.writeFile(formFilePath, JSON.stringify(data, null, 2), 'utf-8');
}


export async function getRequestsAction() {
    try {
        const requests = await readRequestsFile();
        // Return pending requests first, then approved ones
        requests.sort((a, b) => {
            if (a.status === 'pending' && b.status !== 'pending') return -1;
            if (a.status !== 'pending' && b.status === 'pending') return 1;
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
        return { success: true, requests };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function approveRequestAction(email: string) {
    try {
        // Approve user in the main user file
        await approveUserByEmail(email);

        // Update the status in the request log
        const requests = await readRequestsFile();
        const requestIndex = requests.findIndex(r => r.email === email);

        if (requestIndex !== -1) {
            requests[requestIndex].status = 'approved';
            await writeRequestsFile(requests);
        }

        return { success: true, message: `User ${email} has been approved.` };
    } catch (error: any) {
        return { success: false, error: `Failed to approve request: ${error.message}` };
    }
}
