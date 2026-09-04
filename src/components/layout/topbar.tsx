'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu as MenuIcon,
  Moon,
  Search,
  Settings,
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
  isSuperAdmin: boolean;
}

/**
 * No hay `fullName` disponible en el token (ver ARCHITECTURE.md §4) — el
 * "nombre" que se muestra es el email, y el "rol" es una etiqueta gruesa
 * derivada de `isSuperAdmin` (no el nombre real del `Role`, que es por
 * empresa y no viaja en el JWT). Ajustar cuando el backend exponga el perfil
 * completo del usuario autenticado.
 */
function readTokenInfo(): TokenDisplayInfo | null {
  const token = getAccessToken();
  return token ? decodeJwtPayload<TokenDisplayInfo>(token) : null;
}

function getInitials(email: string): string {
  return email.charAt(0).toUpperCase();
}

export function TopBar() {
  const { toggle } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [tokenInfo] = useState<TokenDisplayInfo | null>(readTokenInfo);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayName = tokenInfo?.email ?? 'Usuario';
  const roleLabel = tokenInfo?.isSuperAdmin ? 'Super Administrador' : 'Usuario';

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
        <button type="button" className="topbar-icon-btn" aria-label="Buscar">
          <Search size={20} strokeWidth={1.5} />
        </button>
        <button type="button" className="topbar-icon-btn relative" aria-label="Notificaciones">
          <Bell size={20} strokeWidth={1.5} />
          <span className="circle absolute right-1.5 top-1.5 h-2 w-2" style={{ background: 'var(--danger)' }} />
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
                <p className="text-[0.9375rem] font-semibold">{displayName}</p>
                <p className="mt-0.5 text-xs" style={{ color: 'var(--text-placeholder)' }}>
                  {roleLabel}
                </p>
              </div>

              <div className="px-2 py-2">
                <button type="button" onClick={() => setMenuOpen(false)} className="topbar-menu-item">
                  <UserCircle2 size={20} strokeWidth={1.5} />
                  <span className="tipo-normal">Mi perfil</span>
                </button>
                <button type="button" onClick={() => setMenuOpen(false)} className="topbar-menu-item">
                  <Settings size={20} strokeWidth={1.5} />
                  <span className="tipo-normal">Configuración</span>
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
