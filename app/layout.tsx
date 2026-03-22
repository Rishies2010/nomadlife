import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://nomadlife.qzz.io"),
  title: "NomadLife - The Minecraft Nexus",
  description: "Creative + Anarchy | Cross-play Java/Bedrock | 24/7 | Season 3",
  openGraph: {
    title: "NomadLife - The Minecraft Nexus",
    description: "Creative + Anarchy | Cross-play (Java/Bedrock) | 24/7 | Anti-cheat | Discord-MC chat.",
    images: ["/images/logo_main.jpg"],
    type: "website",
  },
  themeColor: "#7c3aed",
  icons: { icon: "/images/favicon/favicon-32x32.png", apple: "/images/favicon/apple-touch-icon.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <Nav />
        <main className="relative z-10 pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
