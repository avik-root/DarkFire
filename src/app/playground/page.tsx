
"use client";

import PayloadGenerator from "@/components/payload-generator";
import ProfileSettings from "@/components/profile-settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HardHat, UserCog } from "lucide-react";

export default function PlaygroundPage() {
  return (
    <div className="space-y-8 opacity-0 animate-fade-in-up">
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
