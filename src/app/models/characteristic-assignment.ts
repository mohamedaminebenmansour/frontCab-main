export interface CharacteristicAssignment {
  id?: number; // Optional for create
  valueRange: string;
  defaultValue: string;
  unitOfMeasure: string;
  isRequired: boolean;
  materialId: number;
  characteristicId: number;
  createdAt?: Date;
  lastUpdated?: Date;
}