'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface SidebarContextValue {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

/** Mismo breakpoint `lg` de Tailwind (`tailwind.config`/default) — usado acá
 * en JS porque `close()` necesita saber si está en mobile o desktop, algo
 * que CSS solo no puede decidir dentro de un event handler. */
const LG_BREAKPOINT_PX = 1024;

function isMobileViewport(): boolean {
  return typeof window !== 'undefined' && window.innerWidth < LG_BREAKPOINT_PX;
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        toggle: () => setIsOpen((v) => !v),
        // Se llama al navegar por un link del menú (pensado para cerrar el
        // cajón en mobile) — en desktop el sidebar es parte del layout, no
        // un cajón, así que un click en un link nunca debe colapsarlo (ese
        // colapso ahí solo lo dispara el botón "Alternar menú" a propósito,
        // vía `toggle()`).
        close: () => {
          if (isMobileViewport()) {
            setIsOpen(false);
          }
        },
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error('useSidebar debe usarse dentro de <SidebarProvider>');
  }
  return ctx;
}
