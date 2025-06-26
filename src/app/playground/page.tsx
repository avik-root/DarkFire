
"use client";

import { useAuth } from "@/contexts/AuthContext";
import PayloadGenerator from "@/components/payload-generator";
import ProfileSettings from "@/components/profile-settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HardHat, UserCog, ShieldAlert, Wrench } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getMaintenanceStatusAction } from "@/app/actions";

export default function PlaygroundPage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    if (!loading && user && !user.formSubmitted) {
      router.push('/request-access');
    }
    async function checkStatus() {
      const status = await getMaintenanceStatusAction();
      setMaintenanceMode(status);
      setCheckingStatus(false);
    }
    checkStatus();
  }, [user, loading, router]);
  
  if (loading || checkingStatus || !user) {
    return (
       <div className="space-y-8">
        <div className="text-center">
            <Skeleton className="h-12 w-1/2 mx-auto mb-2"/>
            <Skeleton className="h-6 w-3/4 mx-auto"/>
        </div>
        <Skeleton className="w-[400px] h-10 mx-auto" />
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/4 mb-2"/>
                <Skeleton className="h-5 w-1/2"/>
            </CardHeader>
            <CardContent className="space-y-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-10 w-full" />
            </CardContent>
        </Card>
      </div>
    );
  }

  if (maintenanceMode && !isAdmin) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="w-full max-w-lg text-center p-6">
          <CardHeader>
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
              <Wrench className="w-12 h-12 text-primary" />
            </div>
            <CardTitle className="text-3xl font-headline mt-4">Under Maintenance</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              The site is currently under maintenance. Code generation is temporarily disabled. Please check back later.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!user.codeGenerationEnabled) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="w-full max-w-lg text-center p-6">
          <CardHeader>
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
              <ShieldAlert className="w-12 h-12 text-primary" />
            </div>
            <CardTitle className="text-3xl font-headline mt-4">Access Pending</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Your request for access has been submitted. An administrator will review it shortly. Please check back later.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-headline tracking-tighter">
            Playground for <span className="text-primary">No Mercy</span>
          </h1>
          <p className="mt-2 text-lg text-foreground/70">
            Forge your tools and manage your operative profile.
          </p>
      </div>

      <Tabs defaultValue="forge" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px] mx-auto">
          <TabsTrigger value="forge">
            <HardHat className="mr-2 h-4 w-4" />
            Payload Forge
          </TabsTrigger>
          <TabsTrigger value="settings">
            <UserCog className="mr-2 h-4 w-4" />
            Profile Settings
          </TabsTrigger>
        </TabsList>
        <TabsContent value="forge" className="mt-6">
          <PayloadGenerator />
        </TabsContent>
        <TabsContent value="settings" className="mt-6">
          <ProfileSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
