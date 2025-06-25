
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { submitPurchaseRequestAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PawPrint, Heart, Loader2 } from "lucide-react";

const purchaseFormSchema = z.object({
  plan: z.enum(["plan1", "plan2", "plan3"], {
    required_error: "You need to select a donation plan.",
  }),
});

type PurchaseFormValues = z.infer<typeof purchaseFormSchema>;

const plans = [
    { id: "plan1", name: "Pup Pack", price: 301, credits: "30 + 1 Free", description: "A small boost for your projects.", icon: <PawPrint className="w-8 h-8 text-primary" /> },
    { id: "plan2", name: "Guardian Pack", price: 550, credits: "70 + 5 Free", description: "A solid pack for regular users.", icon: <Heart className="w-8 h-8 text-primary" /> },
    { id: "plan3", name: "Champion Pack", price: 1313, credits: "200 + 50 Free", description: "For the power users and true champions of the cause.", icon: <Heart className="w-8 h-8 text-primary fill-primary" /> },
]

export default function PurchasePage() {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<PurchaseFormValues>({
        resolver: zodResolver(purchaseFormSchema),
    });

    const onSubmit = async (data: PurchaseFormValues) => {
        if (!user?.email || !user?.name) {
            toast({ variant: "destructive", title: "Error", description: "You must be logged in to make a purchase." });
            return;
        }

        const result = await submitPurchaseRequestAction({
            name: user.name,
            email: user.email,
            plan: plans.find(p => p.id === data.plan)?.name || "Unknown Plan",
        });

        if (result.success) {
            toast({ title: "Request Submitted!", description: result.message, duration: 8000 });
            router.push('/playground');
        } else {
            toast({ variant: "destructive", title: "Submission Failed", description: result.message });
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-12 space-y-12 opacity-0 animate-fade-in-up">
             <div className="text-center space-y-4">
                <div className="inline-block bg-primary/10 p-4 rounded-full">
                    <Heart className="w-12 h-12 text-primary" />
                </div>
                <h1 className="text-5xl font-headline text-primary tracking-tighter">Be Their Hero: Support a Pawsome Cause</h1>
                <p className="max-w-2xl mx-auto text-lg text-foreground/80">
                    Your generosity fuels our mission to help street animals in need. Every contribution makes a world of difference, and as a heartfelt thank you, we'll top up your account with credits to power your projects.
                </p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Choose Your Donation Pack</CardTitle>
                    <CardDescription>Select a pack below to submit your request.</CardDescription>
                </CardHeader>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardContent>
                             <FormField
                              control={form.control}
                              name="plan"
                              render={({ field }) => (
                                <FormItem className="space-y-4">
                                  <FormControl>
                                    <RadioGroup
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                      className="grid grid-cols-1 md:grid-cols-3 gap-6"
                                    >
                                        {plans.map((plan) => (
                                            <FormItem key={plan.id}>
                                                <FormControl>
                                                    <RadioGroupItem value={plan.id} className="sr-only" />
                                                </FormControl>
                                                <FormLabel className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:ring-4 [&:has([data-state=checked])]:ring-primary/50 cursor-pointer transition-all">
                                                    {plan.icon}
                                                    <div className="text-center mt-4">
                                                        <h3 className="text-xl font-headline">{plan.name}</h3>
                                                        <p className="font-bold text-2xl text-primary">₹{plan.price}</p>
                                                        <p className="text-sm font-semibold">{plan.credits} Credits</p>
                                                        <p className="text-xs text-muted-foreground mt-2">{plan.description}</p>
                                                    </div>
                                                </FormLabel>
                                            </FormItem>
                                        ))}
                                    </RadioGroup>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="mt-8 text-center text-sm text-muted-foreground bg-card p-4 rounded-md border">
                                <p className="font-semibold">How it works:</p>
                                <p>1. After submitting, please contact <strong className="text-primary">payments@darkfire.dev</strong> with your registered email to complete the payment.</p>
                                <p>2. Your credits will be reflected in your account within 24-36 hours of payment confirmation.</p>
                            </div>

                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={form.formState.isSubmitting} className="w-full md:w-auto mx-auto">
                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit Purchase Request
                            </Button>
                        </CardFooter>
                    </form>
                 </Form>
            </Card>
        </div>
    )
}
