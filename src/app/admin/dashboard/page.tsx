
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Users, Bot, TrendingUp, ShieldAlert } from "lucide-react";

const stats = [
  { title: "Total Users", value: "1,254", icon: <Users className="h-6 w-6 text-muted-foreground" />, change: "+12%" },
  { title: "Payloads Generated", value: "8,321", icon: <Bot className="h-6 w-6 text-muted-foreground" />, change: "+8.5%" },
  { title: "Success Rate", value: "97.3%", icon: <TrendingUp className="h-6 w-6 text-muted-foreground" />, change: "+1.2%" },
  { title: "Threats Neutralized", value: "42", icon: <ShieldAlert className="h-6 w-6 text-muted-foreground" />, change: "-5%" },
];

const recentActivity = [
  { user: "user1@example.com", payloadType: "Reverse Shell", language: "Python", timestamp: "2024-07-29 14:30" },
  { user: "hacker_pro@proton.me", payloadType: "Keylogger", language: "C++", timestamp: "2024-07-29 14:25" },
  { user: "sec_analyst@corp.com", payloadType: "Ransomware", language: "Go", timestamp: "2024-07-29 14:10" },
  { user: "user_x@hotmail.com", payloadType: "File Exfiltrator", language: "PowerShell", timestamp: "2024-07-29 13:55" },
  { user: "test@darkfire.com", payloadType: "Credential Harvester", language: "JavaScript", timestamp: "2024-07-29 13:40" },
];

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
              <p className={`text-xs ${stat.change.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>{stat.change} vs last month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Payload</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivity.map((activity, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium truncate max-w-32">{activity.user}</TableCell>
                    <TableCell>{activity.payloadType}</TableCell>
                    <TableCell><Badge variant="outline">{activity.language}</Badge></TableCell>
                    <TableCell className="text-right text-muted-foreground text-xs">{activity.timestamp}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
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
