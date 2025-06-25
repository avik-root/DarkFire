import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { AuthProvider } from "@/contexts/AuthContext";
import fs from 'fs/promises';
import path from 'path';
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "DarkFire",
  description: "AI-powered custom malware generation tool.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adminFilePath = path.join(process.cwd(), 'src', 'data', 'admin.json');
  let adminLoginUrl = '/signup'; // Default to signup

  try {
    const adminData = await fs.readFile(adminFilePath, 'utf-8');
    const admins: unknown[] = JSON.parse(adminData);
    if (admins && admins.length > 0) {
      adminLoginUrl = '/login';
    }
  } catch (error) {
    // If file doesn't exist, is empty, or has invalid JSON, default to signup.
  }

  const headersList = headers();
  const pathname = headersList.get("next-url") || "";
  const isAdminPage = pathname.startsWith('/admin');

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Roboto:wght@400;500;700&family=Source+Code+Pro:wght@400;600&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col bg-background">
        <AuthProvider>
          {!isAdminPage && <Header />}
          <div className={cn("flex-grow", !isAdminPage && "container mx-auto px-4 py-8")}>
            {children}
          </div>
          {!isAdminPage && <Footer adminLoginUrl={adminLoginUrl} />}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
