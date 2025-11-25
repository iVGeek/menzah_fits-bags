import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Menzah_fits | Handcrafted Coastal Crochet Fashion",
  description: "Premium handcrafted crochet dresses and outfits from the Kenyan coast. Authentic, artistic, and elegantly crafted fashion.",
  keywords: "crochet, fashion, Kenya, coastal, handmade, dresses, outfits, artisan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
