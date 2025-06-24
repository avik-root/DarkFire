
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUsersAction, deleteUserAction, getTeamMembersAction, updateTeamMemberAction } from "@/app/admin/actions";
import type { PublicUser } from "@/lib/auth-shared";
import { useToast } from "@/hooks/use-toast";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


type TeamMember = {
  name: string;
  role: string;
  avatar: string;
  handle: string;
  bio: string;
  hint: string;
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    const result = await getUsersAction();
    if (result.success && result.users) {
      setUsers(result.users);
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
    setLoading(false);
  };
  
  const fetchTeam = async () => {
    setLoadingTeam(true);
    const result = await getTeamMembersAction();
    if (result.success && result.team) {
      setTeamMembers(result.team);
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
    setLoadingTeam(false);
  };

  useEffect(() => {
    fetchUsers();
    fetchTeam();
  }, []);

  const handleDeleteUser = async (email: string) => {
    const result = await deleteUserAction(email);
    if (result.success) {
      toast({ title: "Success", description: "User deleted successfully."});
      fetchUsers(); // Refresh the user list
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
             toast({ variant: "destructive", title: "Error", description: "File is too large. Maximum size is 2MB." });
             return;
        }
        setSelectedFile(file);
    }
  }

  const handleUpdateAvatar = async () => {
    if (!editingMember || !selectedFile) return;
    
    setIsUpdating(true);

    try {
        const imageDataUrl = await fileToBase64(selectedFile);
        const result = await updateTeamMemberAction(editingMember.handle, imageDataUrl);
        
        if (result.success) {
          toast({ title: "Success", description: "Team member avatar updated." });
          fetchTeam();
          setEditingMember(null);
          setSelectedFile(null);
        } else {
          toast({ variant: "destructive", title: "Error", description: result.error });
        }
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to process image file." });
    } finally {
        setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8 opacity-0 animate-fade-in-up">
       <h1 className="text-4xl font-headline tracking-tighter">User & Team Management</h1>
       <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>View and manage regular user accounts.</CardDescription>
          </CardHeader>
          <CardContent>
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-36" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-md ml-auto" /></TableCell>
                      </TableRow>
                    ))
                ) : users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="capitalize">{user.role}</TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" disabled={user.role === 'admin'}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the user account for <span className="font-medium text-foreground">{user.email}</span>.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => handleDeleteUser(user.email)}
                              >
                                Delete User
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No users have signed up yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Team Profile Management</CardTitle>
                <CardDescription>Update avatars for the "About Us" page.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Avatar</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="text-right w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingTeam ? (
                          Array.from({ length: 2 }).map((_, i) => (
                            <TableRow key={i}>
                              <TableCell><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
                              <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                              <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                              <TableCell className="text-right"><Skeleton className="h-8 w-16 rounded-md ml-auto" /></TableCell>
                            </TableRow>
                          ))
                      ) : teamMembers.map((member) => (
                        <TableRow key={member.handle}>
                            <TableCell>
                                <Avatar>
                                    <AvatarImage src={member.avatar} alt={member.name} />
                                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </TableCell>
                            <TableCell className="font-medium">{member.name}</TableCell>
                            <TableCell>{member.role}</TableCell>
                            <TableCell className="text-right">
                              <AlertDialog open={editingMember?.handle === member.handle} onOpenChange={(isOpen) => {
                                  if (!isOpen) {
                                      setEditingMember(null);
                                      setSelectedFile(null);
                                  }
                              }}>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" onClick={() => setEditingMember(member)}>Edit</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Edit {editingMember?.name}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Upload a new avatar. Max file size: 2MB.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <div className="grid gap-4 py-4">
                                      <div className="grid w-full max-w-sm items-center gap-1.5">
                                        <Label htmlFor="picture">Picture</Label>
                                        <Input id="picture" type="file" accept="image/png, image/jpeg" onChange={handleFileChange} />
                                      </div>
                                      {selectedFile && (
                                        <div className="mt-2 text-sm text-muted-foreground">
                                          Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                                        </div>
                                      )}
                                  </div>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleUpdateAvatar} disabled={!selectedFile || isUpdating}>
                                        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save Changes
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
