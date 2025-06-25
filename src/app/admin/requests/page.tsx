
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getRequestsAction, approveRequestAction } from "./actions";
import type { RequestEntry } from "./actions";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle, Loader2 } from "lucide-react";

export default function AccessRequestsPage() {
    const [requests, setRequests] = useState<RequestEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [approvingEmail, setApprovingEmail] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchRequests = async () => {
        setLoading(true);
        const result = await getRequestsAction();
        if (result.success && result.requests) {
            setRequests(result.requests);
        } else {
            toast({ variant: "destructive", title: "Error", description: result.error });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchRequests();
    }, [toast]);

    const handleApprove = async (email: string) => {
        setApprovingEmail(email);
        const result = await approveRequestAction(email);
        if (result.success) {
            toast({ title: "Success", description: result.message });
            fetchRequests(); // Refresh the list
        } else {
            toast({ variant: "destructive", title: "Error", description: result.error });
        }
        setApprovingEmail(null);
    };

    return (
        <div className="space-y-8 opacity-0 animate-fade-in-up">
            <h1 className="text-4xl font-headline tracking-tighter">Access Requests</h1>
            <Card>
                <CardHeader>
                    <CardTitle>User Access Requests</CardTitle>
                    <CardDescription>Review and approve requests from users to access the payload generator.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Submitted</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Full Name</TableHead>
                                <TableHead>Occupation</TableHead>
                                <TableHead>Reason</TableHead>
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
                                    <TableRow key={req.email}>
                                        <TableCell className="text-muted-foreground text-xs">
                                            {formatDistanceToNow(new Date(req.timestamp), { addSuffix: true })}
                                        </TableCell>
                                        <TableCell className="font-medium">{req.email}</TableCell>
                                        <TableCell>{req.fullName}</TableCell>
                                        <TableCell>{req.occupation}</TableCell>
                                        <TableCell className="max-w-xs truncate">{req.reason}</TableCell>
                                        <TableCell className="text-right">
                                            {req.status === 'approved' ? (
                                                <Badge variant="secondary" className="text-green-500">
                                                    <CheckCircle className="mr-1 h-4 w-4" />
                                                    Approved
                                                </Badge>
                                            ) : (
                                                <Button 
                                                  size="sm" 
                                                  onClick={() => handleApprove(req.email)}
                                                  disabled={approvingEmail === req.email}
                                                >
                                                  {approvingEmail === req.email && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                  Approve
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        No access requests have been submitted yet.
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
