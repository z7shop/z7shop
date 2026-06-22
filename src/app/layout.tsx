import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/components/layout/Providers";

export const viewport: Viewport = {
  themeColor: "#C9A84C",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Z7shop | فروشگاه پوشاک مردانه",
  description: "فروشگاه آنلاین پوشاک مردانه Z7shop - جدیدترین مدل‌ها با بهترین کیفیت | Z7shop - Premium Men's Fashion Store",
  keywords: ["پوشاک مردانه", "فروشگاه آنلاین", "تی‌شرت", "شلوار", "مد مردانه", "Z7shop"],
  manifest: "/manifest.json",
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          if (!sessionStorage.getItem('z7-splash')) {
            document.documentElement.classList.add('splash-active');
          }
        `}} />
      </head>
      <body className="min-h-screen">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
