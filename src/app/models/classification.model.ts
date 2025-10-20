import { CharacteristicDto } from "./characteristic.model";

export interface ClassificationDto {
  id: number;
  classNumber: string;
  className: string;
  classDescription: string;
  classStatus: number; // Enum value, but as number since API likely sends int
  classGroup: string;
  classHierarchy: string;
  classUsage: string;
  classKeyDate: Date;
  validityStartDate: Date;
  validityEndDate: Date;
  isInherited: boolean;
  classAuthorizationGroup: string;
  characteristics: CharacteristicDto[]; // Array, since ICollection
  createdAt: Date;
  lastUpdated: Date;
}

export interface CreateClassificationDto {
  classNumber: string;
  className: string;
  classDescription: string;
  classStatus: number;
  classGroup: string;
  classHierarchy: string;
  classUsage: string;
  classKeyDate: Date;
  validityStartDate: Date;
  validityEndDate: Date;
  isInherited: boolean;
  classAuthorizationGroup: string;
  characteristics?: CharacteristicDto[]; // Optional, as per DTO
}

export interface UpdateClassificationDto {
  classNumber: string;
  className: string;
  classDescription: string;
  classStatus: number;
  classGroup: string;
  classHierarchy: string;
  classUsage: string;
  classKeyDate: Date;
  validityStartDate: Date;
  validityEndDate: Date;
  isInherited: boolean;
  classAuthorizationGroup: string;
  characteristics?: CharacteristicDto[]; // Optional, as per DTO
}