/**
 * Root Layout
 * 
 * The top-level layout that wraps all pages in the application.
 * Provides essential configuration and base providers without any auth-specific logic.
 * Auth handling is delegated to route groups ((public) and (protected)).
 * 
 * Features:
 * - Global styles and fonts
 * - Base providers (theme, query)
 * - HTML metadata
 * - Dynamic rendering for auth state
 * 
 * Note: This layout is intentionally minimal to allow route groups
 * to handle their specific provider needs.
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BaseProviders } from "@/components/providers/base-providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PledgeKit",
  description: "Crowdfund your product features through user pledges",
};

// Force dynamic rendering for auth state
export const dynamic = 'force-dynamic'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <BaseProviders>
          {children}
        </BaseProviders>
      </body>
    </html>
  );
}
