// src/app/models/material.model.ts

import { ClassificationDto } from './classification.model'; // Assume from previous
import { ControlModelDto } from './control-model.model'; // For relations
import { CharacteristicDto } from './characteristic.model'; // Assume

export interface MaterialDto {
  id: number;
  materialNumber: string;
  materialType: MaterialType; // Enum below
  description: string;
  baseUnitOfMeasure: string;
  materialGroup: string;
  division: string;
  batchManagement: boolean;
  serialNumberManagement: boolean;
  taxClassification: string;
  industrySector: string;
  oldMaterialNumber: string;
  materialHierarchy: string;
  materialStatus: string;
  procurementType: string;
  mrpType: string;
  mrpController: string;
  lotSize: string;
  purchasingGroup: string;
  purchasingValueKey: string;
  accountAssignmentGroup: string;
  valuationClass: string;
  standardPrice: number;
  movingAveragePrice: number;
  taxData: string;
  classificationData: string;
  principalControlModel: ControlModelDto;
  controlModels: ControlModelDto[];
  classifications: ClassificationDto[];
  createdAt: Date;
  lastUpdated: Date;
}

export interface CreateMaterialDto {
  materialNumber: string;
  materialType: MaterialType; // Enum below
  description: string;
  baseUnitOfMeasure: string;
  materialGroup: string;
  division: string;
  batchManagement: boolean;
  serialNumberManagement: boolean;
  taxClassification: string;
  industrySector: string;
  oldMaterialNumber: string;
  materialHierarchy: string;
  materialStatus: string;
  procurementType: string;
  mrpType: string;
  mrpController: string;
  lotSize: string;
  purchasingGroup: string;
  purchasingValueKey: string;
  accountAssignmentGroup: string;
  valuationClass: string;
  standardPrice: number;
  movingAveragePrice: number;
  taxData: string;
  classificationData: string;
}

// Upgraded: Full enum from C# with numeric values (0,1,2) to match backend deserialization
export enum MaterialType {
  ROH = 0,    // Raw Material
  HALB = 1,   // Semi-Finished Product
  FERT = 2    // Finished Product
}

// Reuse MaterialSlimDto from control-model.model.ts if needed, or duplicate if separate
export interface MaterialSlimDto {
  id: number;
  materialNumber: string;
  description: string;
  materialType: string;
  baseUnitOfMeasure: string;
  classificationData: string;
  characteristics: CharacteristicDto[];
  createdAt: Date;
  lastUpdated: Date;
}