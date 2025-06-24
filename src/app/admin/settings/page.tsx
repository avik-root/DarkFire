
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { saveSettingsAction } from "@/app/admin/actions";
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

export default function AdminSettingsPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [allowRegistrations, setAllowRegistrations] = useState(true);
    const [apiKey, setApiKey] = useState("pk_****************");

    const handleSaveChanges = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const settings = {
            maintenanceMode,
            allowRegistrations,
            apiKey
        };

        const result = await saveSettingsAction(settings);

        if (result.success) {
            toast({ title: "Success", description: result.message });
        } else {
            toast({ variant: "destructive", title: "Error", description: result.error || "An unknown error occurred." });
        }

        setIsLoading(false);
    };

    const handleResetData = () => {
        setIsResetting(true);
        // In a real app, this would be a server action that clears data.
        // We'll simulate it with a toast.
        toast({
            variant: "destructive",
            title: "Data Reset (Simulation)",
            description: "Application data has been cleared.",
        });
        setTimeout(() => setIsResetting(false), 1500);
    }

  return (
    <div className="space-y-8 opacity-0 animate-fade-in-up">
      <h1 className="text-4xl font-headline tracking-tighter">Admin Settings</h1>
      
      <form onSubmit={handleSaveChanges}>
        <Card>
            <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Manage application-wide settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
                <Label htmlFor="maintenance-mode" className="pr-4">Maintenance Mode</Label>
                <Switch 
                    id="maintenance-mode" 
                    checked={maintenanceMode}
                    onCheckedChange={setMaintenanceMode}
                />
            </div>
            <div className="flex items-center justify-between">
                <Label htmlFor="new-user-registration" className="pr-4">Allow New User Registrations</Label>
                <Switch 
                    id="new-user-registration" 
                    checked={allowRegistrations}
                    onCheckedChange={setAllowRegistrations}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="api-key">External API Key</Label>
                <Input 
                    id="api-key" 
                    placeholder="Enter your API key" 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                />
            </div>
            <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
            </Button>
            </CardContent>
        </Card>
      </form>

      <Card className="border-destructive">
          <CardHeader>
              <CardTitle className="text-destructive">System Operations</CardTitle>
              <CardDescription>Potentially dangerous actions.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
              <div>
                  <p className="font-semibold">Reset Application Data</p>
                  <p className="text-sm text-muted-foreground">This will clear all non-admin user accounts and generated data.</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive">Reset Data</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone and will permanently delete all user data and generated content. This is a simulation and will not actually delete data.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={handleResetData}
                        disabled={isResetting}
                    >
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
