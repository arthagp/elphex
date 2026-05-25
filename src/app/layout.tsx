import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Elphex | Gamified Task Management Platform",
  description: "Elephant never forgets. Neither does your workflow. Make task management engaging, rewarding, and collaborative with the smart gamification and AI engine of Elphex.",
  keywords: ["productivity", "task manager", "gamification", "pomodoro", "sprint", "kanban", "AI assistant", "workspace"],
  authors: [{ name: "Elphex Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="font-sans antialiased text-slate-100 bg-[#090e1a]">
        {children}
      </body>
    </html>
  );
}
