
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getSettingsAction, saveSettingsAction, resetApplicationDataAction, updateAdminProfileAction, uploadLogoAction } from "@/app/admin/actions";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UpdateAdminSchema } from "@/lib/auth-shared";
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
import PasswordStrengthMeter from "@/components/password-strength-meter";

type AdminProfileFormValues = z.infer<typeof UpdateAdminSchema>;

export default function AdminSettingsPage() {
    const { toast } = useToast();
    const { user, updateUser } = useAuth();
    
    // Loading states
    const [isFetchingSettings, setIsFetchingSettings] = useState(true);
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Password visibility states
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // General Settings state
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [allowRegistrations, setAllowRegistrations] = useState(true);
    const [apiKey, setApiKey] = useState("");

    const form = useForm<AdminProfileFormValues>({
        resolver: zodResolver(UpdateAdminSchema),
        defaultValues: { name: "", email: "", currentPassword: "", password: "", confirmPassword: "" },
    });
    
    const passwordForStrengthMeter = form.watch("password");

    useEffect(() => {
        // Fetch initial general settings
        const fetchSettings = async () => {
            setIsFetchingSettings(true);
            const result = await getSettingsAction();
            if (result.success && result.settings) {
                setMaintenanceMode(result.settings.maintenanceMode);
                setAllowRegistrations(result.settings.allowRegistrations);
                setApiKey(result.settings.apiKey);
            } else {
                toast({ variant: "destructive", title: "Error", description: "Could not load application settings." });
            }
            setIsFetchingSettings(false);
        };

        fetchSettings();

        // Populate admin profile form with current user data
        if (user) {
            form.reset({
                name: user.name,
                email: user.email,
                currentPassword: "",
                password: "",
                confirmPassword: "",
            });
        }

    }, [user, form, toast]);

    const onAdminProfileSubmit = async (data: AdminProfileFormValues) => {
        if (!user) return;
        setIsUpdatingProfile(true);

        const result = await updateAdminProfileAction(user.id, data);

        if (result.success && result.user) {
            toast({ title: "Success", description: result.message });
            updateUser(result.user); // Update user in auth context
            form.reset({ ...data, currentPassword: "", password: "", confirmPassword: "" });
        } else {
            toast({ variant: "destructive", title: "Error", description: result.error });
        }
        setIsUpdatingProfile(false);
    };

    const handleSaveChanges = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingSettings(true);
        const settings = { maintenanceMode, allowRegistrations, apiKey };
        const result = await saveSettingsAction(settings);

        if (result.success) {
            toast({ title: "Success", description: result.message });
        } else {
            toast({ variant: "destructive", title: "Error", description: result.error });
        }
        setIsSavingSettings(false);
    };

    const handleResetData = async () => {
        setIsResetting(true);
        const result = await resetApplicationDataAction();
        if (result.success) {
             toast({ title: "Success", description: result.message });
        } else {
             toast({ variant: "destructive", title: "Error", description: result.error });
        }
        setIsResetting(false);
    }

  return (
    <div className="space-y-8 opacity-0 animate-fade-in-up">
        <h1 className="text-4xl font-headline tracking-tighter">Admin Settings</h1>
        
        <Card>
            <CardHeader>
                <CardTitle>Admin Profile</CardTitle>
                <CardDescription>Update your personal administrator account details.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onAdminProfileSubmit)} className="space-y-4 max-w-sm">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl><Input type="email" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="currentPassword" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Current Password</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input type={showCurrentPassword ? "text" : "password"} placeholder="Enter current password to change it" {...field} value={field.value ?? ""} />
                                        <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground" aria-label={showCurrentPassword ? "Hide password" : "Show password"}>
                                            {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="password" render={({ field }) => (
                            <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                     <div className="relative">
                                        <Input type={showNewPassword ? "text" : "password"} placeholder="Leave blank to keep current" {...field} value={field.value ?? ""} />
                                        <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground" aria-label={showNewPassword ? "Hide password" : "Show password"}>
                                            {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                         <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirm New Password</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm your new password" {...field} value={field.value ?? ""} />
                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground" aria-label={showConfirmPassword ? "Hide password" : "Show password"}>
                                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <PasswordStrengthMeter password={passwordForStrengthMeter} />
                        <Button type="submit" disabled={isUpdatingProfile || form.formState.isSubmitting}>
                            {(isUpdatingProfile || form.formState.isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Profile
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
      
        <form onSubmit={handleSaveChanges}>
            <Card>
                <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>Manage application-wide settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {isFetchingSettings ? <Loader2 className="animate-spin" /> : (
                        <>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="maintenance-mode" className="pr-4">Maintenance Mode</Label>
                                <Switch id="maintenance-mode" checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="new-user-registration" className="pr-4">Allow New User Registrations</Label>
                                <Switch id="new-user-registration" checked={allowRegistrations} onCheckedChange={setAllowRegistrations} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="api-key">External API Key</Label>
                                <Input id="api-key" placeholder="Enter your API key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
                            </div>
                        </>
                    )}
                    <Button type="submit" disabled={isSavingSettings || isFetchingSettings}>
                        {isSavingSettings && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </CardContent>
            </Card>
        </form>

        <Card>
          <CardHeader>
            <CardTitle>Logo Management</CardTitle>
            <CardDescription>Upload a PNG or JPG file to be used as the site logo in the header. Recommended size: 128x128px.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={async (formData) => {
              setIsUploading(true);
              const result = await uploadLogoAction(formData);
              if (result.success) {
                toast({ title: "Success", description: result.message });
                window.location.reload(); 
              } else {
                toast({ variant: "destructive", title: "Error", description: result.error });
              }
              setIsUploading(false);
            }}>
              <div className="flex items-center gap-4">
                <Input name="logo" type="file" accept="image/png, image/jpeg" required />
                <Button type="submit" disabled={isUploading}>
                  {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Upload Logo
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border-destructive">
            <CardHeader>
                <CardTitle className="text-destructive">System Operations</CardTitle>
                <CardDescription>Potentially dangerous actions. This cannot be undone.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
                <div>
                    <p className="font-semibold">Reset Application Data</p>
                    <p className="text-sm text-muted-foreground">This will permanently clear all non-admin user accounts.</p>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="destructive">Reset Data</Button></AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>This action will permanently delete all user data and generated content. Admin accounts will not be affected.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleResetData} disabled={isResetting}>
                                {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Reset Data
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    </div>
  );
}
