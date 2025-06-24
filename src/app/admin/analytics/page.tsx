
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart, Pie, PieChart, Cell, Legend } from "recharts";
import { TrendingUp, Code, Package, Activity } from "lucide-react";

const userGrowthData = [
  { month: "Jan '24", users: 10 },
  { month: "Feb '24", users: 25 },
  { month: "Mar '24", users: 50 },
  { month: "Apr '24", users: 80 },
  { month: "May '24", users: 120 },
  { month: "Jun '24", users: 200 },
];
const userGrowthConfig = { users: { label: "Users", color: "hsl(var(--primary))" } };

const payloadTypeData = [
  { name: "Reverse Shell", value: 400, color: "hsl(var(--chart-1))" },
  { name: "Keylogger", value: 300, color: "hsl(var(--chart-2))" },
  { name: "Ransomware", value: 150, color: "hsl(var(--chart-3))" },
  { name: "File Exfiltrator", value: 200, color: "hsl(var(--chart-4))" },
  { name: "Credential Harvester", value: 180, color: "hsl(var(--chart-5))" },
];

const payloadTypeConfig = {
    value: { label: "Payloads" },
    "Reverse Shell": { label: "Reverse Shell", color: "hsl(var(--chart-1))" },
    "Keylogger": { label: "Keylogger", color: "hsl(var(--chart-2))" },
    "Ransomware": { label: "Ransomware", color: "hsl(var(--chart-3))" },
    "File Exfiltrator": { label: "File Exfiltrator", color: "hsl(var(--chart-4))" },
    "Credential Harvester": { label: "Credential Harvester", color: "hsl(var(--chart-5))" },
};

const languageData = [
    { name: "Python", count: 550 },
    { name: "PowerShell", count: 480 },
    { name: "JavaScript", count: 320 },
    { name: "Bash", count: 210 },
    { name: "C++", count: 150 },
    { name: "Go", count: 90 },
];
const languageConfig = { count: { label: "Count", color: "hsl(var(--accent))" } };

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 opacity-0 animate-fade-in-up">
      <h1 className="text-4xl font-headline tracking-tighter">Application Analytics</h1>
      <p className="text-muted-foreground -mt-4">
        Detailed insights into user activity and payload generation trends.
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5" />
              User Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={userGrowthConfig} className="h-[200px] w-full">
              <LineChart accessibilityLayer data={userGrowthData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Line dataKey="users" type="monotone" stroke="var(--color-users)" strokeWidth={2} dot={true} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Package className="w-5 h-5" />
                    Payload Type Distribution
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={payloadTypeConfig} className="h-[200px] w-full">
                    <PieChart accessibilityLayer>
                        <ChartTooltip content={<ChartTooltipContent nameKey="name" hideIndicator />} />
                        <Pie data={payloadTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                            {payloadTypeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Legend content={({ payload }) => (
                            <ul className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-2 text-xs">
                                {payload?.map((entry, index) => (
                                    <li key={`item-${index}`} className="flex items-center gap-1.5">
                                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                        <span>{entry.payload.name}</span>
                                    </li>
                                ))}
                            </ul>
                        )} />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
                <Code className="w-5 h-5" />
                Language Popularity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={languageConfig} className="h-[200px] w-full">
              <BarChart accessibilityLayer data={languageData} layout="vertical" margin={{ left: 0, right: 10, top: 10 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={5} width={80} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>A log of the most recent payloads generated by users.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground border-2 border-dashed rounded-lg">
                <Activity className="w-12 h-12 mb-4" />
                <p>Real-time activity log feature coming soon.</p>
            </div>
        </CardContent>
       </Card>
    </div>
  );
}
