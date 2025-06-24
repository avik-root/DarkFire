
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ShieldAlert, LayoutDashboard, BarChart3, Users, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

function AdminSkeleton() {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <ShieldAlert className="h-12 w-12 animate-pulse text-primary" />
                <p className="text-muted-foreground">Verifying credentials...</p>
            </div>
        </div>
    );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (user === null && isAuthenticated === false) {
      // Still loading auth state
      return;
    }
    if (!isAuthenticated || !isAdmin) {
      router.push('/login');
    } else {
      setIsVerified(true);
    }
  }, [isAuthenticated, isAdmin, user, router]);

  if (!isVerified) {
    return <AdminSkeleton />;
  }

  return (
    <SidebarProvider defaultOpen>
      <div className="md:hidden flex items-center justify-between p-4 border-b">
         <Link href="/admin/dashboard" className="flex items-center gap-2 text-lg font-headline text-primary">
            <ShieldAlert className="h-7 w-7" />
            <h1>DarkFire Admin</h1>
        </Link>
        <SidebarTrigger />
      </div>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-primary" />
            <div className="flex flex-col">
              <h2 className="text-lg font-headline">DarkFire Admin</h2>
              <p className="text-xs text-muted-foreground">Hyper Advanced Panel</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="/admin/dashboard" tooltip="Dashboard" isActive={pathname === '/admin/dashboard'}>
                <LayoutDashboard />
                Dashboard
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#" tooltip="Analytics" disabled>
                <BarChart3 />
                Analytics
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#" tooltip="User Management" disabled>
                <Users />
                User Management
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton href="#" tooltip="Settings" disabled>
                <Settings />
                Settings
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-3 p-2">
             <Avatar>
                <AvatarImage src={`https://i.pravatar.cc/150?u=${user?.email}`} />
                <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
             </Avatar>
             <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold truncate">{user?.email}</span>
                <span className="text-xs text-muted-foreground">Administrator</span>
             </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
         <div className="p-4 md:p-6">
            {children}
         </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
