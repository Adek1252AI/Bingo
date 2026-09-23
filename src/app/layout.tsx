
import '@/app/globals.css';

export const metadata = {
  title: 'Bingo',
  description: 'Word-based bingo with topic boards and shared links',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
