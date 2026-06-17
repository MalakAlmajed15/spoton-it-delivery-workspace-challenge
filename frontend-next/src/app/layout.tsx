import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SpotOn Intern Challenge',
  description: 'IT Delivery Workspace assessment starter',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
