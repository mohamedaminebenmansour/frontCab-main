// src/app/models/event.model.ts
export enum EventType {  // Updated to number enum to match backend int serialization
  SHIFT_START = 0,
  SHIFT_END = 1,
  CHARACTERISTIC_EVENT = 2,
  PRODUCTION_START = 3,
  PRODUCTION_END = 4
}

export interface EventDto {
  id: number;
  name: string;
  eventType: EventType;  // Added
  eventDate: Date;       // Added
  createdAt: Date;
  controlModelId: number;
  characteristics?: CharacteristicDto[];  
  lastUpdated: Date;
}

export interface CreateEventDto {
  name: string;
  eventType: EventType;  // Added
  eventDate: Date;       // Added
  controlModelId: number;
}

export interface UpdateEventDto extends CreateEventDto {
  id: number;
}

// Re-export existing if needed
import { CharacteristicDto } from './characteristic.model';  