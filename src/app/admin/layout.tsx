
"use client";

import { usePathname } from "next/navigation";
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
import { 
  ShieldAlert, 
  LayoutDashboard, 
  BarChart3, 
  Users, 
  Settings, 
  FileCheck2, 
  Key,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <SidebarProvider defaultOpen>
      <div className="md:hidden flex items-center justify-between px-4 border-b bg-background fixed top-0 left-0 right-0 z-20 h-14">
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
              <SidebarMenuButton asChild tooltip="Dashboard" isActive={pathname === '/admin/dashboard'}>
                <Link href="/admin/dashboard">
                  <LayoutDashboard />
                  Dashboard
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Analytics" isActive={pathname === '/admin/analytics'}>
                <Link href="/admin/analytics">
                  <BarChart3 />
                  Analytics
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Key Activation" isActive={pathname === '/admin/key-activation'}>
                <Link href="/admin/key-activation">
                  <Key />
                  Key Activation
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Access Requests" isActive={pathname === '/admin/requests'}>
                <Link href="/admin/requests">
                  <FileCheck2 />
                  Access Requests
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="User Management" isActive={pathname === '/admin/users'}>
                <Link href="/admin/users">
                  <Users />
                  User Management
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Settings" isActive={pathname === '/admin/settings'}>
                <Link href="/admin/settings">
                  <Settings />
                  Settings
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="p-2">
             <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold truncate">{user?.name}</span>
                <span className="text-xs text-muted-foreground capitalize">{user?.role}</span>
             </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="pt-14 md:pt-0">
         <header className="hidden md:flex h-14 items-center justify-end gap-4 border-b bg-background px-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{user?.name}</span>
              <Button onClick={logout} variant="outline" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
         </header>
         <div className="p-4 md:p-6 opacity-0 animate-fade-in-up">
            {children}
         </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
