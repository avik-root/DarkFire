
"use client";

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { loginAction, verifyPinAction } from "../actions";

export default function LoginPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPinInput, setShowPinInput] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await loginAction({ email, password });
    
    setIsLoading(false);

    if (result.success && result.twoFactorRequired) {
      setShowPinInput(true);
      toast({ title: "PIN Required", description: result.message });
    } else if (result.success && result.user) {
      toast({ title: "Success", description: result.message });
      login(result.user);
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: result.message,
      });
    }
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await verifyPinAction({ email, pin });

    setIsLoading(false);

    if (result.success && result.user) {
      toast({ title: "Success", description: result.message });
      login(result.user);
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: result.message,
      });
    }
  };

  if (showPinInput) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Enter PIN</CardTitle>
          <CardDescription>
            Enter the 6-digit PIN for your account.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handlePinSubmit}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="pin">6-Digit PIN</Label>
              <Input 
                id="pin" 
                type="password" 
                required 
                maxLength={6}
                value={pin} 
                onChange={(e) => setPin(e.target.value)} 
                placeholder="••••••"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : "Verify PIN"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isLoading}>
            {isLoading && <Loader2 className="animate-spin" />}
            Sign in
          </Button>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline hover:text-primary">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
