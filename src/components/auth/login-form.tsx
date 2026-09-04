'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { useLogin } from '@/hooks/auth/use-login';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CompanySelectDialog } from '@/components/auth/company-select-dialog';

const loginSchema = z.object({
  username: z.string().min(1, 'El usuario es obligatorio'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login, loading, error, companyChoices, selectCompany, cancelCompanySelection } =
    useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  return (
    <form onSubmit={handleSubmit(login)} className="flex flex-col gap-5" noValidate>
      <Input
        label="Usuario"
        placeholder="usuario"
        autoFocus
        autoComplete="username"
        error={errors.username?.message}
        {...register('username')}
      />
      <div className="flex flex-col gap-2">
        <Input
          label="Contraseña"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password?.message}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              tabIndex={-1}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="hover:opacity-70"
              style={{ color: 'var(--foreground)' }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          }
          {...register('password')}
        />
        <Link href="/forgot-password" className="tipo-link text-sm font-normal self-end">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
      <Button type="submit" loading={loading} className="w-full mt-2">
        Ingresar
      </Button>
      {error && <p className="tipo-error">{error}</p>}

      {companyChoices && (
        <CompanySelectDialog
          choices={companyChoices}
          onSelect={selectCompany}
          onCancel={cancelCompanySelection}
        />
      )}
    </form>
  );
}
