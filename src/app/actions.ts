"use server";

import { generatePayload, GeneratePayloadInput } from "@/ai/flows/generate-payload";

export async function handleGeneratePayload(input: GeneratePayloadInput): Promise<{ code: string } | { error: string }> {
  try {
    const result = await generatePayload(input);
    return result;
  } catch (error) {
    console.error("Error generating payload:", error);
    return { error: "Failed to generate payload. Please try again." };
  }
}
