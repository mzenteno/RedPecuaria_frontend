/** Espejo de `PaginatedResult`/`PaginationParams` del backend (`domain/common/paginated-result.ts`). */
export interface PaginationParams {
  page: number;
  pageSize: number;
  search?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
