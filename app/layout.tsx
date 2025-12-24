import Script from "next/script";
import "./globals.css";
import { Inter } from "next/font/google";
import type { Metadata, Viewport } from "next";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

const siteTitle = process.env.NEXT_PUBLIC_SITE_TITLE ?? "Happy Hours";
const siteDescription =
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION ??
  "Find happy hours by day, time, and cuisine.";

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  icons: {
    icon: process.env.NEXT_PUBLIC_ICON_PATH ?? "/icons/bellingham/icon.png",
    apple:
      process.env.NEXT_PUBLIC_APPLE_ICON_PATH ??
      "/icons/bellingham/apple-icon.png",
    shortcut:
      process.env.NEXT_PUBLIC_FAVICON_ICO_PATH ??
      "/icons/bellingham/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en" className={inter.className}>
      <body>
        {gaId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', { anonymize_ip: true });
              `}
            </Script>
          </>
        ) : null}

        {children}
      </body>
    </html>
  );
}
