import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { MainNav } from "@/components/navigation/main-nav-server";
import { AuthListener } from "@/components/auth/auth-listener";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PledgeKit",
  description: "Crowdfund your product features through user pledges",
};

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <AuthListener />
          <MainNav />
          {children}
        </Providers>
      </body>
    </html>
  );
}
