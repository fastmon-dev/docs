import "./global.css";

export const metadata = {
  metadataBase: new URL("https://docs.fastmon.eu"),
  title: "fastmon Docs",
  description: "Privacy-first real-user monitoring & Core Web Vitals.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script defer src="https://fastmon.site/s/fc895c8a1fc496726ea3f572186d1cd4.js" />
      </head>
      <body className="flex flex-col min-h-screen">{children}</body>
    </html>
  );
}
