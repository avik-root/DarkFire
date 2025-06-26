
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getPurchaseRequestsAction, approvePurchaseRequestAction } from "./actions";
import type { PurchaseRequest } from "./actions";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Check, Loader2 } from "lucide-react";
import Link from "next/link";


export default function KeyActivationPage() {
    const [requests, setRequests] = useState<PurchaseRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchRequests = async () => {
        setLoading(true);
        const result = await getPurchaseRequestsAction();
        if (result.success && result.requests) {
            setRequests(result.requests);
        } else {
            toast({ variant: "destructive", title: "Error", description: result.error });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleApprove = async (timestamp: string) => {
        setProcessingId(timestamp);
        const result = await approvePurchaseRequestAction(timestamp);
        if (result.success) {
            toast({ title: "Success", description: "Request marked as processed." });
            fetchRequests();
        } else {
            toast({ variant: "destructive", title: "Error", description: result.error });
        }
        setProcessingId(null);
    };

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-headline tracking-tighter">Key Activation Requests</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Donation & Purchase Requests</CardTitle>
                    <CardDescription>
                        Review requests, and after confirming payment, mark them as processed. Then, go to 
                        <Link href="/admin/users" className="text-primary hover:underline font-medium"> User Management </Link> 
                        to add the corresponding activation key and credits.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Submitted</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                                <TableHead className="text-right w-[120px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell>
                                    </TableRow>
                                ))
                            ) : requests.length > 0 ? (
                                requests.map((req) => (
                                    <TableRow key={req.timestamp}>
                                        <TableCell className="text-muted-foreground text-xs">
                                            {formatDistanceToNow(new Date(req.timestamp), { addSuffix: true })}
                                        </TableCell>
                                        <TableCell className="font-medium">{req.name}</TableCell>
                                        <TableCell>{req.email}</TableCell>
                                        <TableCell>{req.plan}</TableCell>
                                         <TableCell className="text-right">
                                            <Badge variant={req.status === 'processed' ? 'secondary' : 'default'}>
                                                {req.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {req.status === 'pending' && (
                                                <Button 
                                                    size="sm" 
                                                    onClick={() => handleApprove(req.timestamp)}
                                                    disabled={processingId === req.timestamp}
                                                >
                                                    {processingId === req.timestamp ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                                                    Mark as Processed
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        No purchase requests have been submitted yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
