
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateUserTwoFactorAction } from "@/app/playground/actions";

const TwoFactorFormSchema = z.object({
  pin: z.string().optional(),
  enabled: z.boolean(),
  password: z.string(),
}).refine((data) => {
    if (data.enabled) {
        return data.pin && /^\d{6}$/.test(data.pin);
    }
    return true;
}, {
    message: "A 6-digit PIN is required to enable.",
    path: ["pin"],
}).refine(data => data.enabled ? !!data.password : true, {
    message: "Your password is required to enable 2FA.",
    path: ["password"],
});

type TwoFactorFormValues = z.infer<typeof TwoFactorFormSchema>;


export default function ProfileSettings() {
  const { user, updateUser, logout } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<TwoFactorFormValues>({
    resolver: zodResolver(TwoFactorFormSchema),
    defaultValues: {
      pin: "",
      enabled: user?.twoFactorEnabled ?? false,
      password: "",
    }
  });
  
  const isEnabled = form.watch("enabled");

  const onSubmit = async (values: TwoFactorFormValues) => {
    if (!user) return;
    
    // This is a simplified check for the prototype. In a real app,
    // you'd send the password to the server to be verified against the hash.
    if (values.enabled && !values.password) {
        form.setError("password", { message: "Password is required to enable 2FA." });
        return;
    }

    const result = await updateUserTwoFactorAction({
      email: user.email,
      enabled: values.enabled,
      pin: values.pin,
      password: values.password, // Pass password for server-side validation (simulated here)
    });
    
    if (result.success && result.user) {
      updateUser(result.user);
      toast({ title: "Success", description: result.message });
      form.reset({ pin: "", enabled: result.user.twoFactorEnabled, password: "" });
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
  };

  const handleDeleteAccount = () => {
    // In a real app, this would call a server action
    toast({
      variant: "destructive",
      title: "Account Deletion",
      description: `Account for ${user?.email} has been deleted (simulation). Logging out...`,
    });
    // Simulate logging out after deletion
    setTimeout(() => {
        logout();
    }, 2000)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage 2-step verification for your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-sm">
                  <FormField
                    control={form.control}
                    name="enabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Enable 2-Step Verification</FormLabel>
                          <FormDescription>Secure your account with a 6-digit PIN on login.</FormDescription>
                        </div>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      </FormItem>
                    )}
                  />
                  {isEnabled && (
                    <FormField
                      control={form.control}
                      name="pin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>6-Digit PIN</FormLabel>
                          <FormControl><Input type="password" maxLength={6} placeholder="Enter a 6-digit PIN" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  {isEnabled && (
                     <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl><Input type="password" placeholder="Enter password to confirm" {...field} /></FormControl>
                           <FormDescription>Required to enable 2FA.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </form>
              </Form>
            </CardContent>
        </Card>

        <Card className="border-destructive">
            <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>This action is permanent and cannot be undone.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <p className="font-semibold">Delete Account</p>
                    <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data.</p>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                         <Button variant="destructive" disabled={user?.role === 'admin'}>Delete My Account</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        account and remove your data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDeleteAccount}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Delete Account
                        </AlertDialogAction>
                    </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    </div>
  );
}
