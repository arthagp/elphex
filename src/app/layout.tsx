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
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const savedTheme = localStorage.getItem('elphex-theme');
                if (savedTheme === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased text-foreground bg-background">
        {children}
      </body>
    </html>
  );
}
