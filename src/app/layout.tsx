import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Postmortem Autopilot',
    description: 'AI-powered blameless post-mortem generator',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
          <html lang="en">
                <body className="min-h-screen bg-slate-50 antialiased">{children}</body>body>
          </html>html>
        );
}</html>
