
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Users, Bot, TrendingUp, ShieldX, Loader2, History, CheckCircle2, XCircle } from "lucide-react";
import { getUsersAction, getAnalyticsDataAction, getActivityLogAction, type ActivityLogEntry } from "@/app/admin/actions";
import type { PublicUser } from "@/lib/auth-shared";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";


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
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [usersResult, analyticsResult, activityResult] = await Promise.all([
        getUsersAction(),
        getAnalyticsDataAction(),
        getActivityLogAction()
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
        setAnalytics({
          payloadsGenerated: 0,
          successfulGenerations: 0,
          failedGenerations: 0,
          generationHistory: [],
        });
      }

       if (activityResult.success && activityResult.log) {
        setActivityLog(activityResult.log.slice(0, 5));
      } else {
        toast({ variant: "destructive", title: "Error", description: "Failed to load activity log." });
      }

      setLoading(false);
    };
    fetchData();
  }, [toast]);
  
  const totalAttempts = analytics ? analytics.successfulGenerations + analytics.failedGenerations : 0;
  const successRate = totalAttempts > 0 && analytics ? (analytics.successfulGenerations / totalAttempts) * 100 : 0;
  const currentMonth = new Date().toLocaleString('default', { month: 'short' });
  const thisMonthGenerations = analytics?.generationHistory.find(h => h.month === currentMonth)?.generated || 0;

  const stats = [
    { title: "Total Users", value: loading ? <Skeleton className="h-6 w-1/4" /> : users.length, icon: <Users className="h-6 w-6 text-muted-foreground" />, subtext: "Registered non-admin accounts." },
    { title: "Payloads Generated", value: loading || !analytics ? <Skeleton className="h-6 w-1/4" /> : analytics.payloadsGenerated.toLocaleString(), icon: <Bot className="h-6 w-6 text-muted-foreground" />, subtext: `+${thisMonthGenerations} this month.` },
    { title: "Success Rate", value: loading || !analytics ? <Skeleton className="h-6 w-1/4" /> : `${successRate.toFixed(1)}%`, icon: <TrendingUp className="h-6 w-6 text-muted-foreground" />, subtext: "All-time generation success." },
    { title: "Generation Failures", value: loading || !analytics ? <Skeleton className="h-6 w-1/4" /> : analytics.failedGenerations.toLocaleString(), icon: <ShieldX className="h-6 w-6 text-muted-foreground" />, subtext: "All-time generation failures." },
  ];

  return (
    <div className="space-y-8">
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
               <div className="text-xs text-muted-foreground">
                {loading ? <Skeleton className="h-4 w-3/4 mt-1" /> : stat.subtext}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Payload Generation Trends</CardTitle>
          </CardHeader>
          <CardContent>
            {loading || !analytics ? (
              <div className="h-[300px] w-full flex justify-center items-center rounded-md border border-dashed">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
             ) : (
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
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
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Recent Activity
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                     Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 py-2">
                            <Skeleton className="h-5 w-5 rounded-full" />
                            <div className="space-y-1.5 flex-grow">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                    ))
                ) : activityLog.length > 0 ? (
                    <div className="space-y-4">
                        {activityLog.map((log, index) => (
                            <div key={index} className="flex items-center gap-4 text-sm">
                                <div>
                                    {log.status === 'success' ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    ) : (
                                        <XCircle className="h-5 w-5 text-red-500" />
                                    )}
                                </div>
                                <div className="flex-grow">
                                    <p className="font-medium">
                                        <span className="font-semibold">{log.payloadType}</span>
                                        <span className="text-muted-foreground"> ({log.language})</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground py-12 text-center">No recent activity.</p>
                )}
            </CardContent>
            <CardFooter>
                <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href="/admin/analytics">View All Activity</Link>
                </Button>
            </CardFooter>
        </Card>
      </div>
    </div>
  );
}
