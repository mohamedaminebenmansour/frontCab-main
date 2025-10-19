// src/app/models/work-center.model.ts
// Explanation: Interfaces mirror your backend DTOs. Use for type safety in API calls and forms.
// Standalone-friendly: No imports needed beyond basics. Add to index.ts export later.

export interface WorkCenter {
  id?: number; // Optional for create
  workCenterNumber: string;
  description: string;
  plant: string;
  costCenter: string;
  capacity: number;
  capacityUnit: string;
  workCenterType: string;
  isActive: boolean;
  createdAt?: Date; // From IAuditableEntity
  lastUpdated?: Date; // From IAuditableEntity
}

export interface CreateWorkCenterDto extends Omit<WorkCenter, 'id' | 'createdAt' | 'lastUpdated'> {}
export interface UpdateWorkCenterDto extends WorkCenter {}
export interface WorkCenterDto extends WorkCenter {} // Full entity for list/view