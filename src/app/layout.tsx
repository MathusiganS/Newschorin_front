import type { Metadata } from "next";

import "../index.css";

export const metadata: Metadata = {
  title: "அகரம்",
  description: "Tamil news portal",
  icons: {
    icon: "/images/Fav_ICON.png",
    shortcut: "/images/Fav_ICON.png",
    apple: "/images/Fav_ICON.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ta">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
