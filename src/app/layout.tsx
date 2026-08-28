import type { Metadata } from "next";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/playfair-display/400.css";
import "@fontsource/playfair-display/500.css";
import "@fontsource/playfair-display/600.css";
import "@fontsource/playfair-display/700.css";
import "@fontsource/cormorant-garamond/300.css";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/cormorant-garamond/700.css";
import "./globals.css";

const playfair = { variable: "--font-playfair" };
const inter = { variable: "--font-inter" };
const cormorant = { variable: "--font-cormorant" };

export const metadata: Metadata = {
  title: "AA Neddles Admin",
  description:
    "Admin panel for AA Neddles — a luxury Pakistani fashion brand offering premium ready-to-wear, haute couture, and bespoke tailoring.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${playfair.variable} ${inter.variable} ${cormorant.variable} font-['Inter',sans-serif] antialiased`}>
        {children}
      </body>
    </html>
  );
}
