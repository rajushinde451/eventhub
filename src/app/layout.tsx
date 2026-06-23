import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: "EventHub – Beautiful Event Invitations & RSVP",
    template: "%s | EventHub",
  },
  description:
    "Create stunning event websites for weddings, birthdays, housewarmings & more. Collect RSVPs, manage guests, and send QR passes.",
  keywords: ["event invitation", "RSVP", "wedding invitation", "birthday party", "event management"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "EventHub",
    title: "EventHub – Beautiful Event Invitations & RSVP",
    description: "Create stunning event websites for weddings, birthdays, housewarmings & more.",
  },
  twitter: {
    card: "summary_large_image",
    title: "EventHub – Beautiful Event Invitations & RSVP",
    description: "Create stunning event websites for weddings, birthdays, housewarmings & more.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
