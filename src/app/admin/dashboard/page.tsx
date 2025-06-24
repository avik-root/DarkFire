
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Users, Bot, TrendingUp, ShieldAlert } from "lucide-react";
import { getUsersAction } from "@/app/admin/actions";
import type { PublicUser } from "@/lib/auth-shared";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";


const chartData = [
  { month: "Jan", generated: 450 },
  { month: "Feb", generated: 590 },
  { month: "Mar", generated: 800 },
  { month: "Apr", generated: 680 },
  { month: "May", generated: 920 },
  { month: "Jun", generated: 1100 },
];

const chartConfig = {
  generated: {
    label: "Generated",
    color: "hsl(var(--primary))",
  },
};

export default function AdminDashboard() {
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
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
    fetchUsers();
  }, []);
  
  const stats = [
    { title: "Total Users", value: loading ? <Skeleton className="h-6 w-1/4" /> : users.length, icon: <Users className="h-6 w-6 text-muted-foreground" />, change: "" },
    { title: "Payloads Generated", value: "8,321", icon: <Bot className="h-6 w-6 text-muted-foreground" />, change: "+8.5%" },
    { title: "Success Rate", value: "97.3%", icon: <TrendingUp className="h-6 w-6 text-muted-foreground" />, change: "+1.2%" },
    { title: "Threats Neutralized", value: "42", icon: <ShieldAlert className="h-6 w-6 text-muted-foreground" />, change: "-5%" },
  ];

  return (
    <div className="space-y-8 opacity-0 animate-fade-in-up">
      <h1 className="text-4xl font-headline tracking-tighter">Admin Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
               <p className={`text-xs ${stat.change.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                {stat.change ? `${stat.change} vs last month` : <>&nbsp;</>}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Payload Generation Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => value.toLocaleString()} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="generated" fill="var(--color-generated)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
