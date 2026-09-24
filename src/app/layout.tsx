import type { Metadata } from 'next';
import { Bebas_Neue, Inter, JetBrains_Mono } from 'next/font/google';
import '@/app/globals.css';

const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Bingo',
  description: 'Word-based bingo with topic boards and shared links',
  icons: {
    icon: '/Bingo/logo.png',
  },
};

const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('bingo-theme');
    if (stored === 'dark' || stored === 'light') {
      document.documentElement.setAttribute('data-theme', stored);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${bebasNeue.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
