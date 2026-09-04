import { Users, Banknote, AlertTriangle, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

/**
 * Dashboard con datos hardcodeados a propósito (ver docs — todavía no existe
 * un módulo de inversiones/lotes en el backend). El diseño replica el de la
 * app de referencia (mismas tarjetas KPI + gráfico + lista + tabla), pero el
 * contenido está adaptado a inversión ganadera. Sin 'use client': es 100%
 * estático, no necesita ningún hook.
 */

// ─── Datos de ejemplo ───────────────────────────────────────────────────────

const mockMeses = [
  { mes: 'Ene', monto: 45000 },
  { mes: 'Feb', monto: 32000 },
  { mes: 'Mar', monto: 58000 },
  { mes: 'Abr', monto: 71000 },
  { mes: 'May', monto: 48000 },
  { mes: 'Jun', monto: 62000 },
];

const mockTopInversionistas = [
  { nombre: 'Fernando Rojas Paz', monto: 50000, inversiones: 3 },
  { nombre: 'Claudia Suárez Terán', monto: 35000, inversiones: 2 },
  { nombre: 'Ricardo Flores Vaca', monto: 28500, inversiones: 2 },
  { nombre: 'Patricia Mendoza Ríos', monto: 15000, inversiones: 1 },
  { nombre: 'Jorge Salvatierra Gil', monto: 12000, inversiones: 1 },
];

const mockLotesEnAlerta = [
  { lote: 'Lote Santa Cruz Norte', tipo: 'Engorde', cabezas: 120, diasAlerta: 45, costo: 1800 },
  { lote: 'Lote Beni Sur', tipo: 'Cría', cabezas: 85, diasAlerta: 18, costo: 950 },
  { lote: 'Lote Trinidad Este', tipo: 'Lechero', cabezas: 60, diasAlerta: 7, costo: 420 },
  { lote: 'Lote Chiquitanía', tipo: 'Engorde', cabezas: 200, diasAlerta: 62, costo: 2600 },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtK(n: number): string {
  return n >= 1000 ? `${Math.round(n / 1000)}k` : String(n);
}

function alertaBadgeStyle(dias: number): { color: string; background: string } {
  if (dias > 30) return { color: 'var(--danger)', background: 'var(--danger-light)' };
  if (dias > 14) return { color: 'var(--warning)', background: 'var(--warning-light)' };
  return { color: 'var(--caution)', background: 'var(--caution-light)' };
}

// ─── Subcomponentes ─────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  delta?: { text: string; up: boolean };
  icon: React.ReactNode;
  iconColor: string;
  iconBackground: string;
}

function KpiCard({ label, value, sub, delta, icon, iconColor, iconBackground }: KpiCardProps) {
  return (
    <div className="card flex items-start justify-between gap-4 p-5">
      <div className="min-w-0">
        <p
          className="mb-2 text-xs font-medium uppercase tracking-wide"
          style={{ color: 'var(--text-muted)' }}
        >
          {label}
        </p>
        <p className="tipo-titulo-card">{value}</p>
        {sub && (
          <p className="mt-0.5 text-xs" style={{ color: 'var(--text-placeholder)' }}>
            {sub}
          </p>
        )}
        {delta && (
          <div
            className="mt-1.5 flex items-center gap-1 text-xs font-medium"
            style={{ color: delta.up ? 'var(--primary)' : 'var(--danger)' }}
          >
            {delta.up ? (
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" strokeWidth={2} />
            )}
            {delta.text} vs mes anterior
          </div>
        )}
      </div>
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center"
        style={{ color: iconColor, background: iconBackground }}
      >
        {icon}
      </div>
    </div>
  );
}

function BarChart() {
  const max = Math.max(...mockMeses.map((d) => d.monto));
  return (
    <div>
      <div className="flex h-44 items-end gap-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        {mockMeses.map((item) => {
          const pct = Math.round((item.monto / max) * 100);
          return (
            <div key={item.mes} className="group relative flex flex-1 flex-col items-center">
              <span
                className="mb-1 text-[10px] opacity-0 transition-opacity group-hover:opacity-100"
                style={{ color: 'var(--text-placeholder)' }}
              >
                {fmtK(item.monto)}
              </span>
              <div
                className="w-full opacity-60 transition-opacity group-hover:opacity-100"
                style={{ height: `${pct}%`, background: 'var(--primary)' }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2">
        {mockMeses.map((item) => (
          <div
            key={item.mes}
            className="flex-1 text-center text-[11px]"
            style={{ color: 'var(--text-placeholder)' }}
          >
            {item.mes}
          </div>
        ))}
      </div>
    </div>
  );
}

function TopInversionistas() {
  const max = mockTopInversionistas[0].monto;
  return (
    <div className="flex flex-col gap-3.5">
      {mockTopInversionistas.map((inversionista, i) => (
        <div key={inversionista.nombre} className="flex items-center gap-3">
          <span
            className="w-4 shrink-0 text-xs font-bold"
            style={{ color: 'var(--border-input)' }}
          >
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="tipo-normal truncate font-medium">{inversionista.nombre}</span>
              <span className="tipo-normal shrink-0 tabular-nums">{fmt(inversionista.monto)}</span>
            </div>
            <div className="h-1.5 w-full" style={{ background: 'var(--border-subtle)' }}>
              <div
                className="h-full opacity-60"
                style={{
                  width: `${Math.round((inversionista.monto / max) * 100)}%`,
                  background: 'var(--primary)',
                }}
              />
            </div>
            <p className="mt-0.5 text-[11px]" style={{ color: 'var(--text-placeholder)' }}>
              {inversionista.inversiones}{' '}
              {inversionista.inversiones === 1 ? 'inversión' : 'inversiones'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Página ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div>
      <h1 className="tipo-titulo-card mb-6">Dashboard</h1>

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Inversionistas activos"
          value="47"
          delta={{ text: '+3', up: true }}
          icon={<Users className="h-5 w-5" strokeWidth={1.5} />}
          iconColor="var(--primary)"
          iconBackground="var(--primary-light)"
        />
        <KpiCard
          label="Capital invertido"
          value="Bs. 234k"
          sub={fmt(234500)}
          delta={{ text: '+12%', up: true }}
          icon={<Banknote className="h-5 w-5" strokeWidth={1.5} />}
          iconColor="var(--primary)"
          iconBackground="var(--primary-light)"
        />
        <KpiCard
          label="Lotes en alerta"
          value="5 lotes"
          sub="320 cabezas afectadas"
          delta={{ text: '+2', up: false }}
          icon={<AlertTriangle className="h-5 w-5" strokeWidth={1.5} />}
          iconColor="var(--danger)"
          iconBackground="var(--danger-light)"
        />
        <KpiCard
          label="Rendimiento del mes"
          value={fmt(12300)}
          delta={{ text: '+8%', up: true }}
          icon={<TrendingUp className="h-5 w-5" strokeWidth={1.5} />}
          iconColor="var(--primary)"
          iconBackground="var(--primary-light)"
        />
      </div>

      {/* Gráfico + Top inversionistas */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="card p-5 lg:col-span-3">
          <h2 className="tipo-titulo-seccion mb-5">Capital invertido por mes</h2>
          <BarChart />
        </div>

        <div className="card p-5 lg:col-span-2">
          <h2 className="tipo-titulo-seccion mb-5">Top inversionistas</h2>
          <TopInversionistas />
        </div>
      </div>

      {/* Tabla de lotes en alerta */}
      <div className="card">
        <div
          className="flex items-center justify-between border-b px-5 py-4"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <h2 className="tipo-titulo-seccion">Lotes en alerta</h2>
          <span className="text-xs font-medium" style={{ color: 'var(--danger)' }}>
            {mockLotesEnAlerta.length} registros
          </span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Lote</th>
              <th>Tipo</th>
              <th className="text-right">Cabezas</th>
              <th className="text-center">Días de alerta</th>
              <th className="text-right">Costo estimado</th>
            </tr>
          </thead>
          <tbody>
            {mockLotesEnAlerta.map((lote) => (
              <tr key={lote.lote}>
                <td className="font-medium">{lote.lote}</td>
                <td>{lote.tipo}</td>
                <td className="text-right tabular-nums">{lote.cabezas}</td>
                <td className="text-center">
                  <span
                    className="inline-block px-2.5 py-0.5 text-xs font-medium"
                    style={alertaBadgeStyle(lote.diasAlerta)}
                  >
                    {lote.diasAlerta} días
                  </span>
                </td>
                <td className="text-right tabular-nums">{fmt(lote.costo)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
