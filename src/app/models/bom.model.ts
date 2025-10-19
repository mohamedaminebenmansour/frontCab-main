// src/app/models/bom.model.ts
import { MaterialDto } from './material.model'; // Import if needed (adjust path if index.ts exports it)

export enum BOMStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  UNDER_REVISION = 'UNDER_REVISION',
  LOCKED = 'LOCKED',
  DELETED = 'DELETED'
}

export interface BOMDto {
  id: number;
  bomNumber: string;
  alternativeBomNumber: string;
  bomStatus: BOMStatus;
  validityStartDate: string; // ISO date string
  validityEndDate: string; // ISO date string
  baseQuantity: string;
  unitOfMeasure: string;
  bomDescription: string;
  principalMaterial: MaterialDto; // Full DTO
  materials: MaterialDto[]; // List of associated materials
}

export interface CreateBOMDto {
  bomNumber: string;
  alternativeBomNumber: string;
  validityStartDate: string; // ISO date string
  validityEndDate: string; // ISO date string
  baseQuantity: string;
  unitOfMeasure: string;
  bomDescription: string;
  principalMaterialId: number; // ID only for create/update
}

export interface UpdateBOMDto extends CreateBOMDto {} // Same as create for update