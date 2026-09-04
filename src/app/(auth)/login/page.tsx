import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <div className="border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-8 px-8 py-8">
        <div className="flex flex-col gap-1">
          <h1 className="tipo-titulo-card">Iniciar sesión</h1>
          <p className="tipo-secundario">Continuar a RedPecuaria</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
