'use client';

import type { ReactNode } from 'react';
import { Banknote, MapPin, TrendingUp, Users } from 'lucide-react';
import { useIsInvestor } from '@/hooks/menu/use-is-investor';
import { useInvestorDashboard } from '@/hooks/dashboard/use-investor-dashboard';
import { useAdminDashboard } from '@/hooks/dashboard/use-admin-dashboard';
import { formatDateOnly } from '@/lib/format-date';

const NUMBER_FORMAT = new Intl.NumberFormat('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function formatNumber(value: number): string {
  return NUMBER_FORMAT.format(value);
}

interface KpiCardProps {
  label: string;
  value: string;
  icon: ReactNode;
}

function KpiCard({ label, value, icon }: KpiCardProps) {
  return (
    <div className="card flex items-center justify-between gap-4 p-5">
      <div className="min-w-0">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
          {label}
        </p>
        <p className="tipo-titulo-card">{value}</p>
      </div>
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center"
        style={{ color: 'var(--primary)', background: 'var(--primary-light)' }}
      >
        {icon}
      </div>
    </div>
  );
}

/**
 * "Mi dashboard" no es lo mismo para todos — un Inversionista (`useIsInvestor`,
 * mismo criterio que `useIsSuperAdmin`, ambos calculados una sola vez al
 * emitir el token) ve datos de sus propias inversiones; Administrador y
 * Super Administrador ven agregados de la empresa activa. Sin
 * `RequirePermission`: es el destino fijo de login (`use-login.ts`) y el
 * fallback de `RequirePermission` en sí, tiene que existir algo acá para
 * cualquiera con sesión, sea cual sea su rol.
 */
export default function DashboardPage() {
  const isInvestor = useIsInvestor();

  return (
    <div>
      <h1 className="tipo-titulo-card mb-6">Dashboard</h1>
      {isInvestor ? <InvestorDashboard /> : <AdminDashboard />}
    </div>
  );
}

function InvestorDashboard() {
  const { investmentsCount, totalSalesReceived, investments, isLoading } = useInvestorDashboard();

  return (
    <div>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <KpiCard
          label="Inversiones activas"
          value={String(investmentsCount)}
          icon={<TrendingUp className="h-5 w-5" strokeWidth={1.5} />}
        />
        <KpiCard
          label="Total recibido en ventas"
          value={formatNumber(totalSalesReceived)}
          icon={<Banknote className="h-5 w-5" strokeWidth={1.5} />}
        />
      </div>

      <div className="card">
        <div className="border-b px-5 py-4" style={{ borderColor: 'var(--border-subtle)' }}>
          <h2 className="tipo-titulo-seccion">Mis inversiones</h2>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Propiedad</th>
                <th>Gestión</th>
                <th>Descripción</th>
                <th className="text-right">Saldo (cabezas)</th>
                <th className="text-right">Saldo (kilos)</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={5} className="data-table-empty">
                    Cargando...
                  </td>
                </tr>
              )}
              {!isLoading &&
                investments.map((investment) => (
                  <tr key={investment.investmentId}>
                    <td>{investment.propertyName}</td>
                    <td>{investment.gestion}</td>
                    <td>{investment.description}</td>
                    <td className="text-right tabular-nums">{investment.currentBalanceQuantity}</td>
                    <td className="text-right tabular-nums">{formatNumber(investment.currentBalanceKilos)}</td>
                  </tr>
                ))}
              {!isLoading && investments.length === 0 && (
                <tr>
                  <td colSpan={5} className="data-table-empty">
                    No participás como inversionista en ninguna inversión todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const {
    propertiesCount,
    activeInvestmentsCount,
    investorsCount,
    totalSalesAmount,
    topInvestors,
    recentMovements,
    isLoading,
  } = useAdminDashboard();

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Propiedades activas"
          value={String(propertiesCount)}
          icon={<MapPin className="h-5 w-5" strokeWidth={1.5} />}
        />
        <KpiCard
          label="Inversiones activas"
          value={String(activeInvestmentsCount)}
          icon={<TrendingUp className="h-5 w-5" strokeWidth={1.5} />}
        />
        <KpiCard
          label="Inversionistas"
          value={String(investorsCount)}
          icon={<Users className="h-5 w-5" strokeWidth={1.5} />}
        />
        <KpiCard
          label="Total en ventas"
          value={formatNumber(totalSalesAmount)}
          icon={<Banknote className="h-5 w-5" strokeWidth={1.5} />}
        />
      </div>

      {/* Apiladas, no lado a lado (`lg:grid-cols-2`): "Últimos movimientos"
          tiene 4 columnas (fecha, propiedad/inversión, detalle, total) — a
          la mitad del ancho, la columna "Total" quedaba fuera de la vista
          sin scrollear (`.data-table-wrapper` la deja accesible con
          scroll horizontal, pero el usuario no tiene por qué adivinar que
          tiene que scrollear para ver el monto). */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="card p-5">
          <h2 className="tipo-titulo-seccion mb-5">Top inversionistas</h2>
          {isLoading && <p className="tipo-secundario">Cargando...</p>}
          {!isLoading && topInvestors.length === 0 && (
            <p className="tipo-secundario">Todavía no hay ventas registradas.</p>
          )}
          {!isLoading && topInvestors.length > 0 && (
            <div className="flex flex-col gap-3.5">
              {topInvestors.map((investor, i) => {
                const max = topInvestors[0].totalSalesReceived;
                return (
                  <div key={investor.userId} className="flex items-center gap-3">
                    <span className="w-4 shrink-0 text-xs font-bold" style={{ color: 'var(--border-input)' }}>
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="tipo-normal truncate font-medium">{investor.fullName}</span>
                        <span className="tipo-normal shrink-0 tabular-nums">
                          {formatNumber(investor.totalSalesReceived)}
                        </span>
                      </div>
                      <div className="h-1.5 w-full" style={{ background: 'var(--border-subtle)' }}>
                        <div
                          className="h-full opacity-60"
                          style={{
                            width: `${Math.round((investor.totalSalesReceived / max) * 100)}%`,
                            background: 'var(--primary)',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card">
          <div className="border-b px-5 py-4" style={{ borderColor: 'var(--border-subtle)' }}>
            <h2 className="tipo-titulo-seccion">Últimos movimientos</h2>
          </div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Propiedad / Inversión</th>
                  <th>Detalle</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={4} className="data-table-empty">
                      Cargando...
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  recentMovements.map((movement) => (
                    <tr key={movement.id}>
                      <td>{formatDateOnly(movement.entryDate)}</td>
                      <td>
                        {movement.propertyName} / {movement.investmentDescription}
                      </td>
                      <td>{movement.detail}</td>
                      <td className="text-right tabular-nums">{formatNumber(movement.total)}</td>
                    </tr>
                  ))}
                {!isLoading && recentMovements.length === 0 && (
                  <tr>
                    <td colSpan={4} className="data-table-empty">
                      Todavía no hay movimientos de kardex registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
