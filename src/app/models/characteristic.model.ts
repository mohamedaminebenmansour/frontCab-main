// src/app/models/characteristic.model.ts
export interface CharacteristicDto {
  id?: number; // Optional for create
  characteristicNumber: string;
  characteristicName: string;
  dataType: string;
  characteristicDescription: string;
  valueRange: string;
  defaultValue: string;
  unitOfMeasure: string;
  isRequired: boolean;
  isSingleValue: boolean;
  characteristicGroup: string;
  validityStartDate: Date;
  validityEndDate: Date;
  createdAt?: Date; // From IAuditableEntity
  lastUpdated?: Date; // From IAuditableEntity
}

export type CreateCharacteristicDto = Omit<CharacteristicDto, 'id' | 'createdAt' | 'lastUpdated'>;

export type UpdateCharacteristicDto = Partial<CharacteristicDto>;