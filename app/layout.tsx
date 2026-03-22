import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });

export const metadata: Metadata = {
  title: "NomadLife — The Minecraft Nexus",
  description: "Creative + Anarchy | Cross-play Java/Bedrock | 24/7 | Season 3",
  openGraph: {
    title: "NomadLife — The Minecraft Nexus",
    description: "Creative + Anarchy | Cross-play Java/Bedrock | 24/7 | Anti-cheat | Discord-MC chat.",
    images: ["/images/logo_main.jpg"],
    type: "website",
  },
  themeColor: "#7c3aed",
  icons: { icon: "/images/favicon/favicon-32x32.png", apple: "/images/favicon/apple-touch-icon.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${space.variable} font-sans grain`}>
        {/* Ambient blobs */}
        <div className="blob w-[700px] h-[700px] bg-purple/10 -top-64 -left-64" />
        <div className="blob w-[500px] h-[500px] bg-pink/7 bottom-[5%] -right-40" />
        <div className="blob w-[300px] h-[300px] bg-purple/6 top-[50%] left-[40%]" />
        <Nav />
        <main className="relative z-10 pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
