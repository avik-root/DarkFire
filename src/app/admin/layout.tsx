
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
import { ShieldAlert, LayoutDashboard, BarChart3, Users, Settings, FileCheck2 } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const pathname = usePathname();

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
      <SidebarInset>
         <div className="p-4 md:p-6">
            {children}
         </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
