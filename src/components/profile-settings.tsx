
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
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

export default function ProfileSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for functionality
    toast({
      title: "Success",
      description: "Password updated successfully (simulation).",
    });
  };
  
  const handleDeleteAccount = () => {
      // Placeholder for functionality
    toast({
      variant: "destructive",
      title: "Account Deletion",
      description: "Account deletion initiated (simulation).",
    });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>Update Password</CardTitle>
                <CardDescription>Change your account password here. Choose a strong, unique password.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-sm">
                    <div className="grid gap-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <div className="relative">
                        <Input id="current-password" type={showCurrentPassword ? "text" : "password"} placeholder="••••••••" />
                        <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                            aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                            >
                            {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                        </div>
                    </div>
                        <div className="grid gap-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <div className="relative">
                        <Input id="new-password" type={showNewPassword ? "text" : "password"} placeholder="••••••••" />
                            <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                            aria-label={showNewPassword ? "Hide password" : "Show password"}
                            >
                            {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                        </div>
                    </div>
                    <Button type="submit">Update Password</Button>
                </form>
            </CardContent>
        </Card>

        <Card className="border-destructive">
            <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>These actions are permanent and cannot be undone.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <p className="font-semibold">Delete Account</p>
                    <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data.</p>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                         <Button variant="destructive">Delete My Account</Button>
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
