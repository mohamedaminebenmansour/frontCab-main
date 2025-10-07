import { EWM_StorageType } from "./ewm-storage-type.model";

export interface StorageTypeRuleCreateDTO {
  ewm_Code_StorageType_From?: string;
  allowTranferTO?: string;
  blockTranferTO?: string;
}

export interface StorageTypeRuleResponseDTO {
  idewm_Location_Rules: number;
  ewM_Code_StorageType_From?: string;
  allowTranferTO?: string;
  blockTranferTO?: string;
}

// If needed, keep entity for internal use, but map from DTOs
export interface EWM_StorageType_Rules {
  IDEWM_Location_Rules: number;
  EWM_Code_StorageType_From?: string;
  AllowTranferTO?: string;
  BlockTranferTO?: string;
}