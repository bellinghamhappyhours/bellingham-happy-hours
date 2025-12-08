import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bellingham Happy Hours",
  description: "Find happy hours in Bellingham by day, time, and cuisine.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
