// src/app/models/production-version.model.ts
import { BOMDto } from './bom.model'; // Import from previous
import { RoutingDto } from './routing.model'; // Import from previous

export interface ProductionVersionDto {
  id: number;
  versionCode: string;
  description: string;
  bom?: BOMDto; // Optional 1:1
  routing?: RoutingDto; // Optional 1:1
  createdAt: Date;
  lastUpdated: Date;
}

export interface CreateProductionVersionDto {
  versionCode: string;
  description: string;
}