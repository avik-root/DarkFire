
"use server";

import { generatePayload, GeneratePayloadInput } from "@/ai/flows/generate-payload";
import fs from 'fs/promises';
import path from 'path';

// This is a simplified analytics tracking mechanism for demonstration.
// In a production app, you'd use a database to avoid race conditions.
async function trackGenerationEvent(type: 'success' | 'failure', details?: { language: string; payloadType: string }) {
    const analyticsFilePath = path.join(process.cwd(), 'src', 'data', 'analytics.json');
    
    type AnalyticsData = {
        payloadsGenerated: number;
        successfulGenerations: number;
        failedGenerations: number;
        generationHistory: { month: string; generated: number }[];
        languageCounts: { [key: string]: number };
        payloadTypeCounts: { [key: string]: number };
    };
    
    let data: AnalyticsData;

    try {
        const fileContents = await fs.readFile(analyticsFilePath, 'utf-8');
        data = JSON.parse(fileContents);
    } catch (e) {
        // If file doesn't exist or is empty, initialize it.
        data = {
            payloadsGenerated: 0,
            successfulGenerations: 0,
            failedGenerations: 0,
            generationHistory: [
                { month: "Jan", generated: 0 }, { month: "Feb", generated: 0 },
                { month: "Mar", generated: 0 }, { month: "Apr", generated: 0 },
                { month: "May", generated: 0 }, { month: "Jun", generated: 0 },
                { month: "Jul", generated: 0 }, { month: "Aug", generated: 0 },
                { month: "Sep", generated: 0 }, { month: "Oct", generated: 0 },
                { month: "Nov", generated: 0 }, { month: "Dec", generated: 0 }
            ],
            languageCounts: {},
            payloadTypeCounts: {}
        };
    }
    
    if (type === 'success' && details) {
        data.payloadsGenerated = (data.payloadsGenerated || 0) + 1;
        data.successfulGenerations = (data.successfulGenerations || 0) + 1;

        // Increment count for the current month
        const currentMonth = new Date().toLocaleString('default', { month: 'short' });
        const monthEntry = data.generationHistory.find((h: any) => h.month === currentMonth);
        if (monthEntry) {
            monthEntry.generated += 1;
        }

        // Initialize counts if they don't exist
        data.languageCounts = data.languageCounts || {};
        data.payloadTypeCounts = data.payloadTypeCounts || {};

        // Increment counts for language and payload type
        data.languageCounts[details.language] = (data.languageCounts[details.language] || 0) + 1;
        data.payloadTypeCounts[details.payloadType] = (data.payloadTypeCounts[details.payloadType] || 0) + 1;

    } else if (type === 'failure') {
        data.failedGenerations = (data.failedGenerations || 0) + 1;
    }

    try {
        await fs.writeFile(analyticsFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error("Failed to write analytics data:", error);
    }
}


export async function handleGeneratePayload(input: GeneratePayloadInput): Promise<{ code: string } | { error: string }> {
  try {
    const result = await generatePayload(input);
    
    // Asynchronously track successful generation without blocking the response
    trackGenerationEvent('success', { language: input.language, payloadType: input.payloadType }).catch(console.error);

    return result;
  } catch (error) {
    // Asynchronously track failed generation
    trackGenerationEvent('failure').catch(console.error);
    console.error("Error generating payload:", error);
    return { error: "Failed to generate payload. Please try again." };
  }
}
