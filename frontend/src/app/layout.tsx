import type { Metadata, Viewport } from "next";
import { LanguageProvider } from "@/context/LanguageContext";
import { ModeProvider } from "@/context/ModeContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "CropDoctor AI — Your Crop Health Assistant",
  description:
    "AI-powered crop disease detection for farmers. Scan a leaf, get instant diagnosis and treatment advice in your language.",
  keywords: ["crop disease", "plant health", "AI", "agriculture", "farmer"],
  authors: [{ name: "CropDoctor AI Team" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CropDoctor AI",
  },
};


export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#22C55E",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-surface">
        <LanguageProvider>
          <ModeProvider>
            <main className="mx-auto max-w-md min-h-screen relative">
              {children}
            </main>
          </ModeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
