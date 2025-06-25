
"use server";

import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

const dataDir = path.join(process.cwd(), 'src', 'data');
const purchaseRequestsFilePath = path.join(dataDir, 'purchase-requests.json');

export type PurchaseRequest = {
    timestamp: string;
    name: string;
    email: string;
    plan: string;
    status: 'pending' | 'processed';
};

async function readPurchaseRequestsFile(): Promise<PurchaseRequest[]> {
    try {
        const data = await fs.readFile(purchaseRequestsFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            await fs.writeFile(purchaseRequestsFilePath, JSON.stringify([], null, 2), 'utf-8');
            return [];
        }
        console.error("Error reading purchase requests file:", error);
        return [];
    }
}

async function writePurchaseRequestsFile(data: PurchaseRequest[]): Promise<void> {
    await fs.writeFile(purchaseRequestsFilePath, JSON.stringify(data, null, 2), 'utf-8');
}


const PurchaseRequestSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().email(),
  plan: z.string().min(1, "Plan selection is required."),
});

export async function submitPurchaseRequestAction(data: z.infer<typeof PurchaseRequestSchema>): Promise<{ success: boolean; message: string }> {
    const result = PurchaseRequestSchema.safeParse(data);
    if (!result.success) {
        return { success: false, message: result.error.errors.map(e => e.message).join(', ') };
    }
    
    try {
        const requests = await readPurchaseRequestsFile();
        
        const newRequest: PurchaseRequest = {
            ...data,
            status: 'pending',
            timestamp: new Date().toISOString()
        };
        
        requests.unshift(newRequest);
        await writePurchaseRequestsFile(requests);
        
        return { success: true, message: "Your request has been sent! Please follow the instructions to complete your payment." };

    } catch (error: any) {
        return { success: false, message: `Failed to submit request: ${error.message}` };
    }
}
