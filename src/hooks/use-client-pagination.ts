'use client';

import { useState } from 'react';

/**
 * Paginación 100% del lado del cliente — para listados que el backend NO
 * pagina (trae todo de una), pero que igual conviene no mostrar en una sola
 * tabla larga (ver ARCHITECTURE.md §9, caso "Empresas"). Si el backend llega
 * a paginar un listado (como ya hace `GET /users`), no usar esto — ese caso
 * necesita page/pageSize en la request, no cortar un array ya descargado.
 */
export function useClientPagination<T>(items: T[], pageSize: number) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageItems = items.slice((safePage - 1) * pageSize, safePage * pageSize);

  return {
    page: safePage,
    setPage,
    totalPages,
    pageItems,
    total: items.length,
  };
}
