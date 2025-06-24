
"use server";

import { getUsers as getUsersFromFile, deleteUserByEmail } from "@/lib/auth";

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
