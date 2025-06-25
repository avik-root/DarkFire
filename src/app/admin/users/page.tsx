
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Loader2, ShieldCheck, ShieldOff, Edit, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUsersAction, deleteUserAction, getTeamMembersAction, updateTeamMemberAction, manageUserPermissionAction, updateUserCreditsAction } from "@/app/admin/actions";
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
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const teamMemberUpdateSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty.'),
  role: z.string().min(1, 'Role cannot be empty.'),
  bio: z.string().min(10, 'Bio must be at least 10 characters.'),
  github: z.string().url('Must be a valid URL.').or(z.literal('')).optional(),
  linkedin: z.string().url('Must be a valid URL.').or(z.literal('')).optional(),
  email: z.string().email('Must be a valid email.').or(z.literal('')).optional(),
});
type TeamMemberUpdateFormValues = z.infer<typeof teamMemberUpdateSchema>;

type TeamMember = {
  name: string;
  role: string;
  avatar: string;
  handle: string;
  bio: string;
  hint: string;
  github?: string;
  linkedin?: string;
  email?: string;
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(true);
  
  // User Management state
  const [editingUser, setEditingUser] = useState<PublicUser | null>(null);
  const [secretCode, setSecretCode] = useState('');
  const [isManagingPermission, setIsManagingPermission] = useState(false);
  const [creditAmount, setCreditAmount] = useState<number | string>("");
  const [isManagingCredits, setIsManagingCredits] = useState(false);

  // Team Management state
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const { toast } = useToast();
  
  const form = useForm<TeamMemberUpdateFormValues>({
    resolver: zodResolver(teamMemberUpdateSchema),
  });

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
  }, [toast]);
  
  useEffect(() => {
    if (editingMember) {
      form.reset({
        name: editingMember.name,
        role: editingMember.role,
        bio: editingMember.bio,
        github: editingMember.github || '',
        linkedin: editingMember.linkedin || '',
        email: editingMember.email || '',
      });
    }
  }, [editingMember, form]);

  const handleDeleteUser = async (email: string) => {
    const result = await deleteUserAction(email);
    if (result.success) {
      toast({ title: "Success", description: "User deleted successfully."});
      fetchUsers();
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
  };

  const handleManagePermission = async (action: 'enable' | 'disable') => {
    if (!editingUser) return;
    setIsManagingPermission(true);
    const result = await manageUserPermissionAction({
      email: editingUser.email,
      action,
      secretCode,
    });

    if (result.success) {
      toast({ title: "Success", description: result.message });
      fetchUsers();
      setSecretCode('');
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
    setIsManagingPermission(false);
  }

  const handleSetCredits = async () => {
    if (!editingUser || creditAmount === "") return;
    setIsManagingCredits(true);
    
    const result = await updateUserCreditsAction({
        email: editingUser.email,
        credits: Number(creditAmount),
    });

    if (result.success) {
        toast({ title: "Success", description: result.message });
        fetchUsers();
    } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
    }
    setIsManagingCredits(false);
  }

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
  
  const onUpdateSubmit = async (values: TeamMemberUpdateFormValues) => {
    if (!editingMember) return;
    setIsUpdating(true);

    let avatarDataUrl: string | undefined;
    if (selectedFile) {
      try {
        avatarDataUrl = await fileToBase64(selectedFile);
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to process image file." });
        setIsUpdating(false);
        return;
      }
    }

    const result = await updateTeamMemberAction({
      handle: editingMember.handle,
      ...values,
      avatar: avatarDataUrl,
    });

    if (result.success) {
      toast({ title: "Success", description: result.message });
      fetchTeam();
      setEditingMember(null);
      setSelectedFile(null);
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
    
    setIsUpdating(false);
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
            <Dialog open={!!editingUser} onOpenChange={(isOpen) => {
                if (!isOpen) { 
                    setEditingUser(null);
                    setSecretCode('');
                    setCreditAmount('');
                }
            }}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead className="text-right w-[180px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-36" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-8 w-32 rounded-md ml-auto" /></TableCell>
                        </TableRow>
                      ))
                  ) : users.length > 0 ? (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.codeGenerationEnabled ? 'default' : 'secondary'}>
                            {user.codeGenerationEnabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.credits ?? 'N/A'}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => {
                                setEditingUser(user);
                                setCreditAmount(user.credits ?? 0);
                            }}>
                                <Edit className="mr-2 h-3 w-3" />
                                Manage
                            </Button>
                          </DialogTrigger>

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
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        No users have signed up yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <DialogContent>
                  <DialogHeader>
                      <DialogTitle>Manage User: {editingUser?.name}</DialogTitle>
                      <DialogDescription>{editingUser?.email}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                      <div className="space-y-3">
                          <h4 className="font-medium">Permissions</h4>
                          <div className="space-y-2">
                            <Label htmlFor="secret-code">Secret Code</Label>
                            <Input id="secret-code" type="password" value={secretCode} onChange={(e) => setSecretCode(e.target.value)} placeholder="Enter secret code to change status" />
                          </div>
                          <div className="flex gap-2">
                            <Button variant="destructive" onClick={() => handleManagePermission('disable')} disabled={isManagingPermission || !secretCode}>
                                {isManagingPermission ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldOff className="mr-2 h-4 w-4" />}
                                Disable
                            </Button>
                            <Button onClick={() => handleManagePermission('enable')} disabled={isManagingPermission || !secretCode}>
                                {isManagingPermission ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                                Enable
                            </Button>
                          </div>
                      </div>
                      <Separator />
                       <div className="space-y-3">
                          <h4 className="font-medium">Credits</h4>
                          <div className="space-y-2">
                            <Label htmlFor="credits">Set Credit Amount</Label>
                            <div className="flex gap-2">
                                <Input id="credits" type="number" value={creditAmount} onChange={(e) => setCreditAmount(e.target.value)} placeholder="e.g., 50" className="w-32" />
                                 <Button onClick={handleSetCredits} disabled={isManagingCredits}>
                                    {isManagingCredits ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Set Credits
                                </Button>
                            </div>
                          </div>
                      </div>
                  </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Team Profile Management</CardTitle>
                <CardDescription>Update profiles for the "About Us" page.</CardDescription>
            </CardHeader>
            <CardContent>
                {loadingTeam ? (
                    <div className="h-24 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                ) : teamMembers.length > 0 ? (
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
                        {teamMembers.map((member) => (
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
                              <Dialog open={editingMember?.handle === member.handle} onOpenChange={(isOpen) => {
                                if (!isOpen) { setEditingMember(null); setSelectedFile(null); }
                              }}>
                                <DialogTrigger asChild>
                                  <Button variant="outline" onClick={() => setEditingMember(member)}>Edit</Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Edit {member.name}</DialogTitle>
                                    <DialogDescription>
                                      Update team member details. Click save when you're done.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onUpdateSubmit)} className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div className="space-y-2"><Label>Name</Label><Input {...form.register("name")} />{form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}</div>
                                          <div className="space-y-2"><Label>Role</Label><Input {...form.register("role")} />{form.formState.errors.role && <p className="text-sm text-destructive">{form.formState.errors.role.message}</p>}</div>
                                      </div>
                                       <div className="space-y-2"><Label>Description / Bio</Label><Textarea className="resize-y" {...form.register("bio")} />{form.formState.errors.bio && <p className="text-sm text-destructive">{form.formState.errors.bio.message}</p>}</div>
                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div className="space-y-2"><Label>GitHub URL</Label><Input placeholder="https://github.com/username" {...form.register("github")} />{form.formState.errors.github && <p className="text-sm text-destructive">{form.formState.errors.github.message}</p>}</div>
                                          <div className="space-y-2"><Label>LinkedIn URL</Label><Input placeholder="https://linkedin.com/in/username" {...form.register("linkedin")} />{form.formState.errors.linkedin && <p className="text-sm text-destructive">{form.formState.errors.linkedin.message}</p>}</div>
                                      </div>
                                      <div className="space-y-2"><Label>Email Address</Label><Input placeholder="member@example.com" {...form.register("email")} />{form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}</div>
                                      <div className="space-y-2">
                                        <Label htmlFor="picture">New Avatar</Label>
                                        <Input id="picture" type="file" accept="image/png, image/jpeg" onChange={handleFileChange} />
                                        {selectedFile && <div className="text-sm text-muted-foreground">Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</div>}
                                      </div>
                                      <DialogFooter>
                                        <DialogClose asChild><Button type="button" variant="secondary" onClick={() => setEditingMember(null)}>Cancel</Button></DialogClose>
                                        <Button type="submit" disabled={isUpdating}>
                                            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Save Changes
                                        </Button>
                                      </DialogFooter>
                                    </form>
                                  </Form>
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                </Table>
                 ) : (
                    <div className="h-24 text-center text-muted-foreground flex items-center justify-center">No team members found.</div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
