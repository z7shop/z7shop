import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/components/layout/Providers";

const BASE_URL = 'https://z7shop.ir';

export const viewport: Viewport = {
  themeColor: "#C9A84C",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Z7shop | فروشگاه آنلاین پوشاک مردانه - خرید لباس مردانه",
    template: "%s | Z7shop",
  },
  description: "فروشگاه آنلاین پوشاک مردانه Z7shop — خرید تی‌شرت، شلوار، کفش و لباس ورزشی مردانه با ضمانت اصالت، ارسال سریع و بازگشت ۷ روزه. جدیدترین مدل‌ها با بهترین قیمت.",
  keywords: [
    "پوشاک مردانه", "فروشگاه آنلاین لباس", "خرید لباس مردانه", "تی‌شرت مردانه",
    "شلوار مردانه", "کفش مردانه", "لباس ورزشی مردانه", "مد مردانه",
    "فروشگاه اینترنتی", "Z7shop", "z7shop", "لباس مردانه ارزان",
    "خرید اینترنتی پوشاک", "فشن مردانه", "استایل مردانه",
  ],
  manifest: "/manifest.json",
  applicationName: "Z7shop",
  creator: "Z7shop",
  publisher: "Z7shop",
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  alternates: {
    canonical: BASE_URL,
    languages: {
      "fa-IR": BASE_URL,
      "en": `${BASE_URL}/en`,
    },
  },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    alternateLocale: "en_US",
    url: BASE_URL,
    siteName: "Z7shop",
    title: "Z7shop | فروشگاه آنلاین پوشاک مردانه",
    description: "خرید آنلاین لباس مردانه با ضمانت اصالت، ارسال سریع و بازگشت ۷ روزه. تی‌شرت، شلوار، کفش و لباس ورزشی مردانه.",
    images: [
      {
        url: `${BASE_URL}/images/og-cover.jpg`,
        width: 1200,
        height: 630,
        alt: "Z7shop - فروشگاه پوشاک مردانه",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Z7shop | فروشگاه آنلاین پوشاک مردانه",
    description: "خرید آنلاین لباس مردانه با ضمانت اصالت و ارسال سریع",
    images: [`${BASE_URL}/images/og-cover.jpg`],
    creator: "@z7shop",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "GOOGLE_SITE_VERIFICATION_CODE",
  },
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body className="min-h-screen">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
