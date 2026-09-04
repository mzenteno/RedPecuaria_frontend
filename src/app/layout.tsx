import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import type { ReactNode } from 'react';
import { QueryProvider } from '@/contexts/query.provider';
import { ThemeProvider } from '@/contexts/theme.context';
import './globals.css';

// Misma fuente que el proyecto de referencia (prestamos/frontend).
const poppins = Poppins({
  variable: '--font-app',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'RedPecuaria',
  description: 'Sistema de gestión ganadera',
};

/**
 * Corre antes de la hidratación de React para que el tema oscuro no
 * "parpadee" al cargar la página (se lee del mismo localStorage que usa
 * ThemeProvider, ver contexts/theme.context.tsx).
 */
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var theme = localStorage.getItem('rp_theme');
    if (!theme) {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    if (theme === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className={`${poppins.variable} font-sans antialiased`}>
        <QueryProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
