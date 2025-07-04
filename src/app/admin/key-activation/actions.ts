
"use server";

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
            return [];
        }
        console.error("Error reading purchase requests file:", error);
        return [];
    }
}

async function writePurchaseRequestsFile(data: PurchaseRequest[]): Promise<void> {
    await fs.writeFile(purchaseRequestsFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function getPurchaseRequestsAction() {
    try {
        const requests = await readPurchaseRequestsFile();
        requests.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return { success: true, requests };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function approvePurchaseRequestAction(timestamp: string) {
    try {
        const requests = await readPurchaseRequestsFile();
        const requestIndex = requests.findIndex(r => r.timestamp === timestamp);

        if (requestIndex !== -1) {
            requests[requestIndex].status = 'processed';
            await writePurchaseRequestsFile(requests);
        } else {
            throw new Error("Request not found.");
        }
        return { success: true };
    } catch (error: any) {
        return { success: false, error: `Failed to process request: ${error.message}` };
    }
}
