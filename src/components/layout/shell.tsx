'use client';

import type { ReactNode } from 'react';
import { DashboardSidebar } from './sidebar';
import { SidebarProvider, useSidebar } from './sidebar-context';
import { TopBar } from './topbar';

function ShellBody({ children }: { children: ReactNode }) {
  const { isOpen, close } = useSidebar();

  return (
    <div className="flex min-h-screen">
      {isOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={close}
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
        />
      )}
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-auto p-5 lg:p-6" style={{ background: 'var(--bg-page)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <ShellBody>{children}</ShellBody>
    </SidebarProvider>
  );
}
