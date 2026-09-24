import type { Metadata } from 'next';
import { Bebas_Neue, Inter, JetBrains_Mono } from 'next/font/google';
import '@/app/globals.css';

/* ==========================================================================
   Font Configuration
   - Bebas Neue: Display/headings (loaded via CSS class .font-display)
   - Inter: Body text (applied to body via variable)
   - JetBrains Mono: Numbers/code (loaded via CSS class .font-mono)
   ========================================================================== */
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
};

/**
 * Inline script to initialize theme before paint — prevents FOUC
 * when dark mode is active. Reads localStorage or prefers-color-scheme.
 */
const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('bingo-theme');
    if (stored === 'dark' || stored === 'light') {
      document.documentElement.setAttribute('data-theme', stored);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  } catch (e) {
    // localStorage unavailable — fall back to system preference
  }
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
