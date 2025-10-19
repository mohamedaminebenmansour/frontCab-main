// src/app/models/product-order.model.ts
import { MaterialDto } from './material.model';
import { ProductionVersionDto } from './production-version.model';

export enum ProductOrderStatus {
  CREATED = 'CREATED',
  RELEASED = 'RELEASED',
  IN_PROGRESS = 'IN_PROGRESS',
  CONFIRMED = 'CONFIRMED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED'
}

export interface ProductOrderDto {
  id: number;
  orderNumber: string;
  orderDescription: string;
  orderDate: string; // ISO date
  startDate: string;
  endDate: string;
  plannedQuantity: number;
  actualQuantity: number;
  unitOfMeasure: string;
  material: MaterialDto;
  productionVersion: ProductionVersionDto;
  createdAt: string;
  lastUpdated: string;
}

export interface CreateProductOrderDto {
  orderNumber: string;
  orderDescription: string;
  orderDate: string;
  startDate: string;
  endDate: string;
  plannedQuantity: number;
  actualQuantity: number;
  unitOfMeasure: string;
  materialId: number;
  productionVersionId: number;
}