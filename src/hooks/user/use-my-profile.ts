'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { updateUserUseCase, changeOwnPasswordUseCase } from '@/infrastructure/di/user.container';
import { getAccessToken, getUserId } from '@/infrastructure/http/session-storage';
import { decodeJwtPayload } from '@/lib/decode-jwt';
import type { UpdateUserData, ChangePasswordData } from '@/domain/user/user.entity';

interface ProfileTokenInfo {
  username: string;
  fullName: string;
  email: string;
}

function readProfileFromToken(): ProfileTokenInfo {
  const token = getAccessToken();
  const info = token ? decodeJwtPayload<ProfileTokenInfo>(token) : null;
  return {
    username: info?.username ?? '',
    fullName: info?.fullName ?? '',
    email: info?.email ?? '',
  };
}

/**
 * "Mi perfil": `username`/`fullName`/`email` arrancan del token (mismo
 * criterio que `TopBar` — no hay un `GET /users/:id` para traerlos de la
 * base). Tras un `updateProfile` exitoso, se actualizan con la respuesta
 * real del backend (`User` completo), no con el token — el token queda
 * desactualizado hasta el próximo login/refresh (ver `frontend/
 * ARCHITECTURE.md` §8), así que sin esto la pantalla mostraría el nombre
 * viejo justo después de guardarlo.
 */
export function useMyProfile() {
  const userId = getUserId();
  const [profile, setProfile] = useState(readProfileFromToken);

  const { mutateAsync: updateProfile, isPending: isSavingProfile } = useMutation({
    mutationFn: (data: UpdateUserData) => {
      if (!userId) {
        throw new Error('No hay una sesión activa');
      }
      return updateUserUseCase.execute(userId, data);
    },
    onSuccess: (updated) => {
      setProfile((prev) => ({ ...prev, fullName: updated.fullName, email: updated.email }));
    },
  });

  const { mutateAsync: changePassword, isPending: isChangingPassword } = useMutation({
    mutationFn: (data: ChangePasswordData) => changeOwnPasswordUseCase.execute(data),
  });

  return { profile, updateProfile, isSavingProfile, changePassword, isChangingPassword };
}
