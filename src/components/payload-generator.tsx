
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { handleGeneratePayload, redeemActivationKeyAction } from "@/app/actions";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Bot, Download, HardHat, Loader2, FileCode, Gem, Key } from "lucide-react";

const formSchema = z.object({
  language: z.string({ required_error: "Please select a language." }).min(1, "Please select a language."),
  payloadType: z.string({ required_error: "Please select a payload type." }).min(1, "Please select a payload type."),
  specifications: z.string().min(10, { message: "Specifications must be at least 10 characters." }),
});

type FormValues = z.infer<typeof formSchema>;

const LANGUAGES = ["Python", "JavaScript", "PowerShell", "Bash", "C++", "Go"];
const PAYLOAD_TYPES = ["Reverse Shell", "Keylogger", "Ransomware", "File Exfiltrator", "Credential Harvester"];

export default function PayloadGenerator() {
  const [generatedCode, setGeneratedCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activationKey, setActivationKey] = useState("");
  const [isActivating, setIsActivating] = useState(false);
  const { toast } = useToast();
  const { user, updateUser } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      specifications: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!user?.email) {
      toast({ variant: "destructive", title: "Authentication Error", description: "Could not find user email." });
      return;
    }

    setIsLoading(true);
    setGeneratedCode("");
    const result = await handleGeneratePayload({ ...data, userEmail: user.email });
    setIsLoading(false);

    if ("error" in result) {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    } else {
      setGeneratedCode(result.code);
      updateUser(result.user);
      toast({
        title: "Success",
        description: "Payload generated successfully!",
      });
    }
  };
  
  const handleDownload = () => {
    if (!generatedCode) return;
    const language = form.getValues("language");
    const extensionMap: { [key: string]: string } = {
        "Python": ".py",
        "JavaScript": ".js",
        "PowerShell": ".ps1",
        "Bash": ".sh",
        "C++": ".cpp",
        "Go": ".go"
    };
    const fileExtension = extensionMap[language] || ".txt";
    const blob = new Blob([generatedCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payload${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleActivate = async () => {
    if (!user?.email || !activationKey) return;
    setIsActivating(true);
    const result = await redeemActivationKeyAction({ email: user.email, key: activationKey });
    setIsActivating(false);

    if (result.success && result.user) {
      updateUser(result.user);
      toast({ title: "Success", description: result.message });
      setActivationKey("");
    } else {
      toast({ variant: "destructive", title: "Activation Failed", description: result.message });
    }
  };

  const hasCredits = user?.role === 'admin' || (user?.credits !== undefined && user.credits > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HardHat className="w-8 h-8 text-primary" />
              <CardTitle className="text-3xl font-headline tracking-wider">Payload Forge</CardTitle>
            </div>
            {user && user.role !== 'admin' && (
               <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-secondary px-3 py-1.5 rounded-full">
                <Gem className="w-4 h-4 text-primary" />
                <span>{user.credits ?? 0} Credits</span>
               </div>
            )}
          </div>
          <CardDescription>Specify your requirements to generate custom malware code.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Programming Language</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="payloadType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payload Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a payload type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PAYLOAD_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="specifications"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specifications</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., A reverse shell that connects to 192.168.1.10 on port 4444, with persistence."
                        className="resize-y min-h-[120px] font-code"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading || !hasCredits} className="w-full bg-accent hover:bg-accent/90">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Bot className="mr-2 h-4 w-4" />
                )}
                {hasCredits ? 'Generate Code' : 'Insufficient Credits'}
              </Button>
            </form>
          </Form>
          {!hasCredits && (
              <div className="mt-6 space-y-4 rounded-lg border border-dashed border-accent p-4">
                <h4 className="font-semibold text-center text-accent">Out of Credits</h4>
                <p className="text-sm text-muted-foreground text-center">You've used all your credits. Please enter an activation key to add more.</p>
                <div className="flex gap-2">
                    <Input 
                        placeholder="Enter your activation key"
                        value={activationKey}
                        onChange={(e) => setActivationKey(e.target.value)}
                        disabled={isActivating}
                    />
                    <Button onClick={handleActivate} disabled={isActivating || !activationKey}>
                        {isActivating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Key className="mr-2 h-4 w-4" />
                        Activate
                    </Button>
                </div>
              </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
                <FileCode className="w-8 h-8 text-primary" />
                <CardTitle className="text-3xl font-headline tracking-wider">Generated Script</CardTitle>
            </div>
            <Button onClick={handleDownload} disabled={!generatedCode || isLoading} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download
            </Button>
        </CardHeader>
        <CardContent>
             <div className="relative">
                <Textarea
                    value={generatedCode}
                    onChange={(e) => setGeneratedCode(e.target.value)}
                    placeholder="Generated code will appear here..."
                    className="w-full h-[410px] resize-none font-code bg-black/50 border-dashed"
                />
                {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/80 backdrop-blur-sm rounded-md">
                        <Loader2 className="h-10 w-10 text-primary animate-spin" />
                        <p className="mt-4 text-lg font-semibold">Generating your script...</p>
                        <p className="text-muted-foreground text-sm">This may take a moment.</p>
                    </div>
                )}
             </div>
        </CardContent>
      </Card>
    </div>
  );
}
