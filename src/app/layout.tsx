import "./global.css";

export const metadata = {
  metadataBase: new URL("https://docs.fastmon.eu"),
  title: "Fastmon Docs",
  description: "Privacy-first real-user monitoring & Core Web Vitals.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">{children}</body>
    </html>
  );
}
