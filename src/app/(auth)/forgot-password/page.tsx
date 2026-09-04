import Link from 'next/link';

export const metadata = { title: 'Recuperar contraseña' };

/**
 * Placeholder: todavía no existe backend para recuperación de contraseña
 * (sin tabla de reset tokens ni envío de email). Ver ARCHITECTURE.md §4 —
 * es un punto pendiente, igual que la autorización por permisos.
 */
export default function ForgotPasswordPage() {
  return (
    <div className="border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 px-8 py-8">
        <div className="flex flex-col gap-1">
          <h1 className="tipo-titulo-card">Recuperar contraseña</h1>
          <p className="tipo-secundario">
            Todavía no está disponible la recuperación automática. Contacta a un administrador
            de tu empresa para restablecer tu contraseña.
          </p>
        </div>
        <Link href="/login" className="tipo-link">
          Volver a iniciar sesión
        </Link>
      </div>
    </div>
  );
}
