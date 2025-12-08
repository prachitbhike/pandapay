import type { Metadata } from "next";
import { PrivyProvider } from "@/providers/PrivyProvider";
import { Header } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Panda - Event Ticketing with Bonding Curves",
  description:
    "Buy event tickets with dynamic pricing. Early supporters get the best prices.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0a0a] antialiased">
        <PrivyProvider>
          <Header />
          <main className="container mx-auto px-4 py-8">{children}</main>
        </PrivyProvider>
      </body>
    </html>
  );
}
