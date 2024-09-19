// import { Metadata } from 'next';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';

const APP_NAME = "PWA AcmeApp";
const APP_DEFAULT_TITLE = "My Awesome PWA AcmeApp";
const APP_TITLE_TEMPLATE = "%s - PWA AcmeApp";
const APP_DESCRIPTION = "Best PWA app in the world!";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: 'manifest.json',
  metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  icons: [
    { rel: "apple-touch-icon", url: "icons/icon-144x144.png" },
    { rel: "icon", url: "icons/icon-16x16.png" },
    { rel: "icon", url: "icons/icon-32x32.png" },
    { rel: "icon", url: "icons/icon-70x70.png" },
    { rel: "icon", url: "icons/icon-144x144.png" },
    { rel: "icon", url: "icons/icon-150x150.png" },
    { rel: "icon", url: "icons/icon-310x310.png" },
    { rel: "icon", url: "icons/icon-510x510.png" },
  ],
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  minimumScale: 1,
  initialScale: 1,
  width:"device-width",
  viewportFit:'cover'
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
