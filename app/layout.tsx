import { MyContextProvider } from "./_components/useGameContext";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <MyContextProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </MyContextProvider>
  );
}
