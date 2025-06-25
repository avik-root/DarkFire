
"use server";

import { generatePayload, GeneratePayloadInput } from "@/ai/flows/generate-payload";
import fs from 'fs/promises';
import path from 'path';

// --- Type Definitions ---
type AnalyticsData = {
    payloadsGenerated: number;
    successfulGenerations: number;
    failedGenerations: number;
    generationHistory: { month: string; generated: number }[];
    languageCounts: { [key: string]: number };
    payloadTypeCounts: { [key: string]: number };
};

type ActivityLogEntry = {
    timestamp: string;
    status: 'success' | 'failure';
    language: string;
    payloadType: string;
};

// --- File Paths ---
const dataDir = path.join(process.cwd(), 'src', 'data');
const analyticsFilePath = path.join(dataDir, 'analytics.json');
const activityLogFilePath = path.join(dataDir, 'activity-log.json');
const MAX_LOG_ENTRIES = 20;

// --- Unified Event Tracking ---
async function trackGenerationEvent(type: 'success' | 'failure', details: { language: string; payloadType: string }) {
    // --- Log individual activity ---
    let activityLog: ActivityLogEntry[];
    try {
        const logContents = await fs.readFile(activityLogFilePath, 'utf-8');
        activityLog = JSON.parse(logContents);
    } catch (e) {
        activityLog = [];
    }

    const newLogEntry: ActivityLogEntry = {
        timestamp: new Date().toISOString(),
        status: type,
        ...details,
    };

    activityLog.unshift(newLogEntry);
    if (activityLog.length > MAX_LOG_ENTRIES) {
        activityLog.splice(MAX_LOG_ENTRIES);
    }
    
    try {
        await fs.writeFile(activityLogFilePath, JSON.stringify(activityLog, null, 2), 'utf-8');
    } catch (error) {
        console.error("Failed to write activity log:", error);
    }

    // --- Update aggregate analytics ---
    if (type === 'failure') return; // Don't update aggregates for failures for now, besides the failure count handled in handleGeneratePayload

    let analyticsData: AnalyticsData;
    try {
        const fileContents = await fs.readFile(analyticsFilePath, 'utf-8');
        analyticsData = JSON.parse(fileContents);
    } catch (e) {
        analyticsData = {
            payloadsGenerated: 0,
            successfulGenerations: 0,
            failedGenerations: 0,
            generationHistory: Array.from({ length: 12 }, (_, i) => ({ month: new Date(0, i).toLocaleString('default', { month: 'short' }), generated: 0 })),
            languageCounts: {},
            payloadTypeCounts: {}
        };
    }
    
    analyticsData.payloadsGenerated = (analyticsData.payloadsGenerated || 0) + 1;
    analyticsData.successfulGenerations = (analyticsData.successfulGenerations || 0) + 1;

    const currentMonth = new Date().toLocaleString('default', { month: 'short' });
    const monthEntry = analyticsData.generationHistory.find(h => h.month === currentMonth);
    if (monthEntry) {
        monthEntry.generated += 1;
    }

    analyticsData.languageCounts = analyticsData.languageCounts || {};
    analyticsData.payloadTypeCounts = analyticsData.payloadTypeCounts || {};

    analyticsData.languageCounts[details.language] = (analyticsData.languageCounts[details.language] || 0) + 1;
    analyticsData.payloadTypeCounts[details.payloadType] = (analyticsData.payloadTypeCounts[details.payloadType] || 0) + 1;

    try {
        await fs.writeFile(analyticsFilePath, JSON.stringify(analyticsData, null, 2), 'utf-8');
    } catch (error) {
        console.error("Failed to write analytics data:", error);
    }
}


async function trackFailure(details: { language: string; payloadType: string }) {
    // Log individual activity
    logActivity({ status: 'failure', ...details }).catch(console.error);

    // Update aggregate failure count
    let analyticsData: AnalyticsData;
    try {
        const fileContents = await fs.readFile(analyticsFilePath, 'utf-8');
        analyticsData = JSON.parse(fileContents);
    } catch (e) {
         analyticsData = {
            payloadsGenerated: 0,
            successfulGenerations: 0,
            failedGenerations: 0,
            generationHistory: Array.from({ length: 12 }, (_, i) => ({ month: new Date(0, i).toLocaleString('default', { month: 'short' }), generated: 0 })),
            languageCounts: {},
            payloadTypeCounts: {}
        };
    }

    analyticsData.failedGenerations = (analyticsData.failedGenerations || 0) + 1;

    try {
        await fs.writeFile(analyticsFilePath, JSON.stringify(analyticsData, null, 2), 'utf-8');
    } catch (error) {
        console.error("Failed to write analytics data:", error);
    }
}


export async function handleGeneratePayload(input: GeneratePayloadInput): Promise<{ code: string } | { error: string }> {
  try {
    const result = await generatePayload(input);
    trackGenerationEvent('success', { language: input.language, payloadType: input.payloadType }).catch(console.error);
    return result;
  } catch (error) {
    trackFailure({ language: input.language, payloadType: input.payloadType }).catch(console.error);
    console.error("Error generating payload:", error);
    return { error: "Failed to generate payload. Please try again." };
  }
}
