// src/app/models/routing.model.ts
import { WorkCenterDto } from './work-center.model'; // Import if exists; adjust path

export interface RoutingDto {
  id: number;
  routingNumber: string;
  description: string;
  workCenters: WorkCenterDto[]; // List of associated work centers
  createdAt: Date;
  lastUpdated: Date;
}

export interface CreateRoutingDto {
  routingNumber: string;
  description: string;
  workCenterIds?: number[]; // Optional list for initial assignment
}