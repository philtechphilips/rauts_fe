import type { Metadata } from 'next';
import AuthLayoutClient from './AuthLayoutClient';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AuthLayoutClient>{children}</AuthLayoutClient>;
}
