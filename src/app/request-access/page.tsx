
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { submitRequestAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const requestFormSchema = z.object({
  fullName: z.string().min(3, { message: "Full name must be at least 3 characters." }),
  occupation: z.string().min(3, { message: "Occupation must be at least 3 characters." }),
  reason: z.string().min(20, { message: "Please provide a reason of at least 20 characters." }).max(500, "Reason cannot exceed 500 characters."),
  terms: z.literal<boolean>(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions." }),
  }),
});

type RequestFormValues = z.infer<typeof requestFormSchema>;

export default function RequestAccessPage() {
    const { user, updateUser, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<RequestFormValues>({
        resolver: zodResolver(requestFormSchema),
        defaultValues: { fullName: "", occupation: "", reason: "", terms: false },
    });

    useEffect(() => {
        // If the user already submitted, redirect them to the playground
        if (user && user.formSubmitted) {
            router.push('/playground');
        }
    }, [user, router]);
    
    if (loading || !user) {
        return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (user.formSubmitted) {
        return <div className="flex items-center justify-center py-12"><p>Redirecting...</p></div>;
    }


    const onSubmit = async (data: RequestFormValues) => {
        if (!user?.email) {
            toast({ variant: "destructive", title: "Error", description: "User not found. Please log in again." });
            return;
        }

        const result = await submitRequestAction({ ...data, email: user.email });
        if (result.success && result.user) {
            toast({ title: "Success", description: result.message });
            updateUser(result.user); // Update user in context
            router.push('/playground');
        } else {
            toast({ variant: "destructive", title: "Submission Failed", description: result.message });
        }
    };

    return (
        <div className="flex items-center justify-center py-12">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle className="text-3xl font-headline">Request Access</CardTitle>
                    <CardDescription>
                        To ensure responsible use, access to the payload generator requires approval. Please fill out the form below.
                    </CardDescription>
                </CardHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg">Terms and Conditions</h3>
                                <div className="p-4 border rounded-md max-h-40 overflow-y-auto text-sm text-muted-foreground space-y-2">
                                    <p>You agree that this tool is provided for educational and authorized security testing purposes only. Any use for malicious activities, including targeting systems for which you do not have explicit, written permission, is strictly prohibited.</p>
                                    <p>You acknowledge your understanding of relevant laws concerning cybercrime and criminal acts. The creators and providers of this website accept no responsibility or liability for any misuse of this tool or for any legal trouble incurred by the user as a result of their actions.</p>
                                </div>
                                <FormField
                                    control={form.control}
                                    name="terms"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>I have read, understood, and agree to the terms and conditions.</FormLabel>
                                                <FormMessage />
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            
                            <div className="space-y-4">
                                <FormField control={form.control} name="fullName" render={({ field }) => (
                                    <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="occupation" render={({ field }) => (
                                    <FormItem><FormLabel>Occupation / Role</FormLabel><FormControl><Input placeholder="e.g., Penetration Tester, Security Researcher" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="reason" render={({ field }) => (
                                    <FormItem><FormLabel>Reason for Access</FormLabel><FormControl><Textarea placeholder="Please describe how you intend to use this tool for ethical and educational purposes." className="resize-y" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit Request
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </div>
    );
}
