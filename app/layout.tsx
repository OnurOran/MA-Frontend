import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/src/providers/QueryProvider";
import { AuthProvider } from "@/src/features/auth/context/AuthContext";
import { Toaster } from "sonner";

const geistSans = { variable: "" };
const geistMono = { variable: "" };

export const metadata: Metadata = {
  title: "Survey Application",
  description: "Internal and public survey management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster position="top-right" richColors />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
