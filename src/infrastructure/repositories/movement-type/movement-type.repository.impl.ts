import type { MovementTypeRepository } from '@/domain/movement-type/movement-type.repository';
import type { MovementType } from '@/domain/movement-type/movement-type.entity';
import { httpClient } from '../../http/http-client';

export class MovementTypeRepositoryImpl implements MovementTypeRepository {
  async list(): Promise<MovementType[]> {
    return httpClient.get<MovementType[]>('/kardex-movement-types');
  }
}
