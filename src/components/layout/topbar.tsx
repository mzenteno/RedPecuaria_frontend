'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  ChevronDown,
  LogOut,
  Menu as MenuIcon,
  Moon,
  Search,
  Sun,
  UserCircle2,
} from 'lucide-react';
import { useTheme } from '@/contexts/theme.context';
import { authRepository } from '@/infrastructure/di/auth.container';
import { clearSession, getAccessToken, getRefreshToken } from '@/infrastructure/http/session-storage';
import { decodeJwtPayload } from '@/lib/decode-jwt';
import { useSidebar } from './sidebar-context';
import { CompanySwitcher } from './company-switcher';

interface TokenDisplayInfo {
  email: string;
  username: string;
  fullName: string;
  isSuperAdmin: boolean;
}

function readTokenInfo(): TokenDisplayInfo | null {
  const token = getAccessToken();
  return token ? decodeJwtPayload<TokenDisplayInfo>(token) : null;
}

function getInitials(name: string): string {
  return name.charAt(0).toUpperCase();
}

export function TopBar() {
  const { toggle } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const [tokenInfo] = useState<TokenDisplayInfo | null>(readTokenInfo);
  const menuRef = useRef<HTMLDivElement>(null);

  // `username`/`fullName` pueden faltar en una sesión ya abierta antes de
  // este cambio (el token no se vuelve a emitir hasta el próximo
  // login/refresh) — el email es un respaldo razonable mientras tanto.
  // El trigger (afuera) y el avatar muestran `username`; el header del
  // dropdown muestra el nombre real arriba y el email debajo.
  const displayName = tokenInfo?.username || tokenInfo?.email || 'Usuario';
  const displayFullName = tokenInfo?.fullName || displayName;
  const displayEmail = tokenInfo?.email ?? '';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleLogout(): Promise<void> {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await authRepository.logout(refreshToken);
      } catch {
        // el logout local se hace igual aunque falle la llamada al backend
      }
    }
    clearSession();
    // El QueryClient vive en la raíz de la app (query.provider.tsx) y nunca
    // se recrea entre sesiones — sin este `clear()`, todo lo que quedó en
    // cache (menú, permisos, listados) sigue "fresco" para React Query y se
    // le muestra tal cual al próximo usuario que se loguee en la misma
    // pestaña, aunque sea una persona/empresa/rol distinto.
    queryClient.clear();
    router.push('/login');
  }

  return (
    <header
      className="h-14 flex items-center justify-between px-4 border-b shrink-0"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="flex items-center min-w-0">
        <button
          type="button"
          onClick={toggle}
          className="topbar-icon-btn shrink-0"
          aria-label="Alternar menú"
        >
          <MenuIcon size={20} strokeWidth={1.5} />
        </button>
        <CompanySwitcher />
      </div>

      <div className="flex items-center gap-1">
        {/* "Notificaciones" se quitó (2026-09-06) — sin ningún evento de
            negocio que notificar todavía, no tenía sentido dejar el ícono
            decorativo indefinidamente (ver `ARCHITECTURE.md` §8). "Buscar"
            sigue decorativo a propósito, pendiente de un buscador global
            real cuando se justifique. */}
        <button type="button" className="topbar-icon-btn" aria-label="Buscar">
          <Search size={20} strokeWidth={1.5} />
        </button>

        <div className="relative ml-1" ref={menuRef}>
          <button type="button" onClick={() => setMenuOpen((v) => !v)} className="topbar-user-trigger">
            <div
              className="circle w-8 h-8 flex items-center justify-center text-white text-xs font-semibold shrink-0"
              style={{ background: 'var(--primary)' }}
            >
              {getInitials(displayName)}
            </div>
            <span className="hidden sm:block text-[0.9375rem] font-medium">{displayName}</span>
            <ChevronDown size={16} strokeWidth={1.5} style={{ color: 'var(--text-placeholder)' }} />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-64 border shadow-sm z-50"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="border-b px-5 py-4" style={{ borderColor: 'var(--border-subtle)' }}>
                <p className="text-[0.9375rem] font-semibold">{displayFullName}</p>
                <p className="mt-0.5 text-xs" style={{ color: 'var(--text-placeholder)' }}>
                  {displayEmail}
                </p>
              </div>

              <div className="px-2 py-2">
                <button
                  type="button"
                  onClick={() => {
                    router.push('/profile');
                    setMenuOpen(false);
                  }}
                  className="topbar-menu-item"
                >
                  <UserCircle2 size={20} strokeWidth={1.5} />
                  <span className="tipo-normal">Mi perfil</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toggleTheme();
                    setMenuOpen(false);
                  }}
                  className="topbar-menu-item"
                >
                  {theme === 'dark' ? <Sun size={20} strokeWidth={1.5} /> : <Moon size={20} strokeWidth={1.5} />}
                  <span className="tipo-normal">{theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}</span>
                </button>
              </div>

              <div className="border-t px-2 py-2" style={{ borderColor: 'var(--border-subtle)' }}>
                <button type="button" onClick={handleLogout} className="topbar-menu-item-danger">
                  <LogOut size={20} strokeWidth={1.5} />
                  <span className="tipo-normal" style={{ color: 'var(--danger)' }}>
                    Cerrar sesión
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
