import {
  Building2,
  Circle,
  ClipboardList,
  KeyRound,
  LayoutDashboard,
  MapPin,
  Settings,
  ShieldCheck,
  TrendingUp,
  Users,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react';

/**
 * El campo `icon` de `GET /me/menu` siempre viene `null` hoy (el backend no
 * lo puebla) — el ícono es una decisión de presentación, así que se resuelve
 * acá por `key` (estable, no cambia aunque cambie el label). `Circle` es el
 * ícono por defecto para cualquier `key` que no esté mapeada.
 *
 * Es un componente propio (no una variable `const Icon = getIcon(...)`
 * resuelta dentro de otro render) para no disparar la regla
 * `react-hooks/static-components` del React Compiler.
 */
const ICONS_BY_KEY: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  administration: Settings,
  companies: Building2,
  users: Users,
  roles: ShieldCheck,
  permissions: KeyRound,
  'investment-management': TrendingUp,
  properties: MapPin,
  investments: TrendingUp,
  kardex: ClipboardList,
};

export function MenuIcon({ menuKey, ...props }: { menuKey: string } & LucideProps) {
  const IconComponent = ICONS_BY_KEY[menuKey] ?? Circle;
  return <IconComponent {...props} />;
}
