import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-4 text-center">
      <p className="tipo-titulo-card">404</p>
      <p className="tipo-secundario">La página que buscás no existe.</p>
      <Link href="/" className="tipo-link">
        Volver al inicio
      </Link>
    </div>
  );
}
