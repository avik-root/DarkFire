
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Users, Bot, TrendingUp, ShieldX, Loader2 } from "lucide-react";
import { getUsersAction, getAnalyticsDataAction } from "@/app/admin/actions";
import type { PublicUser } from "@/lib/auth-shared";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

type AnalyticsData = {
    payloadsGenerated: number;
    successfulGenerations: number;
    failedGenerations: number;
    generationHistory: { month: string; generated: number }[];
};

const chartConfig = {
  generated: {
    label: "Generated",
    color: "hsl(var(--primary))",
  },
};

export default function AdminDashboard() {
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [usersResult, analyticsResult] = await Promise.all([
        getUsersAction(),
        getAnalyticsDataAction()
      ]);
      
      if (usersResult.success && usersResult.users) {
        setUsers(usersResult.users);
      } else {
        toast({ variant: "destructive", title: "Error", description: "Failed to load user data." });
      }

      if (analyticsResult.success && analyticsResult.data) {
        setAnalytics(analyticsResult.data);
      } else {
        toast({ variant: "destructive", title: "Error", description: "Failed to load analytics data." });
        // Set default analytics data on failure
        setAnalytics({
          payloadsGenerated: 0,
          successfulGenerations: 0,
          failedGenerations: 0,
          generationHistory: [],
        });
      }

      setLoading(false);
    };
    fetchData();
  }, [toast]);
  
  const totalAttempts = analytics ? analytics.successfulGenerations + analytics.failedGenerations : 0;
  const successRate = totalAttempts > 0 ? (analytics.successfulGenerations / totalAttempts) * 100 : 0;

  const stats = [
    { title: "Total Users", value: loading ? <Skeleton className="h-6 w-1/4" /> : users.length, icon: <Users className="h-6 w-6 text-muted-foreground" /> },
    { title: "Payloads Generated", value: loading || !analytics ? <Skeleton className="h-6 w-1/4" /> : analytics.payloadsGenerated.toLocaleString(), icon: <Bot className="h-6 w-6 text-muted-foreground" /> },
    { title: "Success Rate", value: loading || !analytics ? <Skeleton className="h-6 w-1/4" /> : `${successRate.toFixed(1)}%`, icon: <TrendingUp className="h-6 w-6 text-muted-foreground" /> },
    { title: "Generation Failures", value: loading || !analytics ? <Skeleton className="h-6 w-1/4" /> : analytics.failedGenerations.toLocaleString(), icon: <ShieldX className="h-6 w-6 text-muted-foreground" /> },
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
               <p className="text-xs text-muted-foreground">
                <>&nbsp;</>
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
            {loading || !analytics ? (
              <div className="h-[250px] w-full flex justify-center items-center rounded-md border border-dashed">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
             ) : (
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <BarChart accessibilityLayer data={analytics.generationHistory.slice(0, 6)}>
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
