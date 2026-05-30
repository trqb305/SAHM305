import type { Metadata, Viewport } from "next";
import { Cairo, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { ToastProvider } from "@/components/ui/toast";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-cairo",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "سهم 305 — منصة القرار التحليلي للسوق السعودي",
  description: "منصة عربية بالدعوة فقط مخصصة لتحليل سوق الأسهم السعودي بسبعة محركات تحليل آلية. ليست توصية، بل قرار محسوب.",
  keywords: ["تداول", "السوق السعودي", "تحليل أسهم", "تاسي", "سهم 305"],
  authors: [{ name: "سهم 305" }],
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "سهم 305",
    description: "منصة القرار التحليلي للسوق السعودي",
    type: "website",
    locale: "ar_SA",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF7F0" },
    { media: "(prefers-color-scheme: dark)", color: "#060D14" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme on first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('sahm305-theme');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){document.documentElement.classList.add('dark');}})();`,
          }}
        />
      </head>
      <body className={`${cairo.variable} ${mono.variable} font-sans`}>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
