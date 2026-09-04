import { CreatePropertyUseCaseImpl } from '@/application/property/create-property.use-case.impl';
import { UpdatePropertyUseCaseImpl } from '@/application/property/update-property.use-case.impl';
import { DeactivatePropertyUseCaseImpl } from '@/application/property/deactivate-property.use-case.impl';
import { ListPropertiesUseCaseImpl } from '@/application/property/list-properties.use-case.impl';
import { PropertyRepositoryImpl } from '../repositories/property/property.repository.impl';

export const propertyRepository = new PropertyRepositoryImpl();
export const createPropertyUseCase = new CreatePropertyUseCaseImpl(propertyRepository);
export const updatePropertyUseCase = new UpdatePropertyUseCaseImpl(propertyRepository);
export const deactivatePropertyUseCase = new DeactivatePropertyUseCaseImpl(propertyRepository);
export const listPropertiesUseCase = new ListPropertiesUseCaseImpl(propertyRepository);
