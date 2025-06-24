
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8 opacity-0 animate-fade-in-up">
      <h1 className="text-4xl font-headline tracking-tighter">Admin Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Manage application-wide settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="maintenance-mode" className="pr-4">Maintenance Mode</Label>
            <Switch id="maintenance-mode" />
          </div>
           <div className="flex items-center justify-between">
            <Label htmlFor="new-user-registration" className="pr-4">Allow New User Registrations</Label>
            <Switch id="new-user-registration" defaultChecked />
          </div>
          <div className="space-y-2">
            <Label htmlFor="api-key">External API Key</Label>
            <Input id="api-key" placeholder="Enter your API key" defaultValue="pk_****************" />
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

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
              <Button variant="destructive">Reset Data</Button>
          </CardContent>
      </Card>
    </div>
  );
}
