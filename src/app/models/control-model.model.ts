// src/app/models/control-model.model.ts

import { CharacteristicDto } from "./characteristic.model";
import { MaterialSlimDto } from "./material.model";

export interface ControlModelDto {
  id: number;
  modelType: ControlModelType;
  description: string;
  isPrincipal: boolean;
  characteristics: CharacteristicDto[]; // Assuming you have CharacteristicDto from previous
  materials: MaterialSlimDto[]; // Assuming MaterialSlimDto
  createdAt: Date;
  lastUpdated: Date;
}

export interface CreateControlModelDto {
  name: string; // Note: In C#, it's Name, but DTO has Description? Aligning to provided DTOs; adjust if needed
  description: string;
}

export interface UpdateControlModelDto {
  name: string;
  description: string;
}

export interface CreateControlModelWithMaterialsDto {
  description: string;
  materialIds: number[];
}

export enum ControlModelType {
  PAC = 'PAC',
  TPV = 'TPV'
}






