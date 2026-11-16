import './globals.css';
import Effects from './Effects';
import { readContent } from '../lib/content';

const SITE = 'https://vishnuvardhan-portfolio-three.vercel.app';

export const metadata = {
  metadataBase: new URL(SITE),
  title: { default: 'Vishnu Vardhan — GTM Engineer, Creator & Visual Designer', template: '%s — Vishnu Vardhan' },
  description:
    'I build growth systems and make them seen. GTM engineering (Clay, HubSpot, Apollo, n8n), short-form content for 13.5K+ followers, video editing and motion design.',
  openGraph: {
    title: 'Vishnu Vardhan — I build growth systems and make them seen.',
    description: 'GTM Engineer · Content Creator · Visual Designer',
    images: ['/og.jpg'],
    type: 'website',
  },
  twitter: { card: 'summary_large_image', images: ['/og.jpg'] },
};

export const viewport = { themeColor: '#F4F1EB' };

export default function RootLayout({ children }) {
  const chrome = readContent('chrome');
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: chrome }} />
        {children}
        <Effects />
      </body>
    </html>
  );
}
