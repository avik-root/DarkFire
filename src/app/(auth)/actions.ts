
"use server";

import { z } from "zod";
import { addUser, verifyUser } from "@/lib/auth";
import { CreateUserSchema } from "@/lib/auth-shared";

export async function signupAction(data: unknown): Promise<{ success: boolean; message: string; user?: any }> {
  const result = CreateUserSchema.safeParse(data);

  if (!result.success) {
    const errorMessages = result.error.errors.map(e => e.message).join(", ");
    return { success: false, message: errorMessages };
  }

  try {
    const newUser = await addUser(result.data);
    return { success: true, message: "Account created successfully!", user: newUser };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to create account." };
  }
}

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function loginAction(data: unknown): Promise<{ success: boolean; message: string; user?: any }> {
    const result = LoginSchema.safeParse(data);

    if (!result.success) {
        return { success: false, message: "Invalid email or password format." };
    }

    try {
        const user = await verifyUser(result.data.email, result.data.password);
        if (user) {
            return { success: true, message: "Login successful!", user };
        } else {
            return { success: false, message: "Invalid email or password." };
        }
    } catch (error: any) {
        return { success: false, message: error.message || "An unexpected error occurred." };
    }
}
