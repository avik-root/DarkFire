
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getRequestsAction, approveRequestAction, deleteRequestAction } from "./actions";
import type { RequestEntry } from "./actions";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle, Loader2, LinkIcon, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AccessRequestsPage() {
    const [requests, setRequests] = useState<RequestEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [approvingEmail, setApprovingEmail] = useState<string | null>(null);
    const [deletingEmail, setDeletingEmail] = useState<string | null>(null);
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
    }, []);

    const handleApprove = async (email: string) => {
        setApprovingEmail(email);
        const result = await approveRequestAction(email);
        if (result.success) {
            toast({ title: "Success", description: result.message });
            fetchRequests();
        } else {
            toast({ variant: "destructive", title: "Error", description: result.error });
        }
        setApprovingEmail(null);
    };

    const handleDelete = async (email: string) => {
        setDeletingEmail(email);
        const result = await deleteRequestAction(email);
        if (result.success) {
            toast({ title: "Success", description: result.message });
            fetchRequests();
        } else {
            toast({ variant: "destructive", title: "Error", description: result.error });
        }
        setDeletingEmail(null);
    }

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
                                <TableHead>ID Link</TableHead>
                                <TableHead className="text-right w-[180px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={7}><Skeleton className="h-8 w-full" /></TableCell>
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
                                        <TableCell>
                                            <a href={req.idVerificationLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                                                <LinkIcon className="h-4 w-4" />
                                                View
                                            </a>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex gap-2 justify-end items-center">
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
                                                 <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" disabled={deletingEmail === req.email}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This action will permanently delete the access request for <span className="font-semibold text-foreground">{req.email}</span>. This cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction 
                                                                className="bg-destructive hover:bg-destructive/90"
                                                                onClick={() => handleDelete(req.email)}
                                                                disabled={deletingEmail === req.email}
                                                            >
                                                                 {deletingEmail === req.email && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
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
