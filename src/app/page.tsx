"use client";

import PayloadGenerator from "@/components/payload-generator";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Lock } from "lucide-react";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-8">
      <section 
        className="home-background text-center"
        style={{ '--bg-image': "url('https://placehold.co/1920x1080.png')" } as React.CSSProperties}
        data-ai-hint="futuristic cyberpunk terminal"
      >
        <div className="relative z-10">
          <h1 className="text-6xl md:text-8xl font-headline tracking-tighter text-primary">
            Welcome to DarkFire
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/80">
            Your AI-powered assistant for generating custom security scripts and payloads.
            {isAuthenticated
              ? " You're logged in and ready to forge."
              : " Log in to create tailored code for your security assessments."}
          </p>
        </div>
      </section>

      {isAuthenticated ? (
        <PayloadGenerator />
      ) : (
        <div className="text-center p-10 border-2 border-dashed border-card rounded-lg bg-card/20">
          <Lock className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-6 text-2xl font-semibold">Authentication Required</h2>
          <p className="mt-2 text-muted-foreground">
            Please log in or create an account to access the Payload Forge.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
