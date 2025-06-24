
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 opacity-0 animate-fade-in-up">
      <h1 className="text-4xl font-headline tracking-tighter">Analytics</h1>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <BarChart3 className="w-16 h-16 mb-4" />
          <p className="text-lg">Detailed analytics will be available here in a future update.</p>
        </CardContent>
      </Card>
    </div>
  );
}
