import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import {
  EWM_Aturized_Status,
  EWM_Parck_DisplayGroupe,
  EWM_StorageBinType,
  EWM_StorageBin_Groupe,
  EWM_StorageType,
  EWM_StorageType_Rules,
  EWM_StorageBin,
  EWM_StorageBin_Rules,
  EWM_StorageBin_Details,
  HandlingUnit,
  StockMovement,
  StorageTypeRuleResponseDTO,
  StorageTypeRuleCreateDTO,
  WorkCenterDto,
  UpdateCharacteristicDto,
  CharacteristicDto,
  CreateCharacteristicDto,
  ClassificationDto,
  CreateClassificationDto,
  CreateMaterialDto,
  MaterialDto,
  CharacteristicAssignment,
  UpdateEventDto,
  EventDto,
  CreateEventDto,
  CreateBOMDto,
  BOMDto,
  CreateRoutingDto,
  RoutingDto
} from '../../models'; // Create an index.ts in models folder to export all
import { WorkCenter, CreateWorkCenterDto, UpdateWorkCenterDto } from '../../models';
import { environment } from '../../../environments/environment';
import { ControlModelDto, CreateControlModelDto, CreateControlModelWithMaterialsDto, UpdateControlModelDto } from '../../models/control-model.model';
import { ProductionVersionDto, CreateProductionVersionDto } from '../../models/production-version.model';
import { ProductOrderDto, CreateProductOrderDto } from '../../models/product-order.model';
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:5117/api'; // Replace with your ASP.NET API base URL
  private mescoFiApiUrl = environment.mescoFiApiUrl;
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient) { }

  // Error handling
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('API Error:', error);
    return throwError(() => new Error(`Error Code: ${error.status}\nMessage: ${error.message}`));
  }

  // EWM_Aturized_Status CRUD (Fixed inconsistent update URL)
  getAturizedStatuses(): Observable<EWM_Aturized_Status[]> {
    return this.http.get<EWM_Aturized_Status[]>(`${this.apiUrl}/EWMAturizedStatus`)
      .pipe(catchError(this.handleError));
  }
  getAturizedStatus(id: number): Observable<EWM_Aturized_Status> {
    return this.http.get<EWM_Aturized_Status>(`${this.apiUrl}/EWMAturizedStatus/${id}`)
      .pipe(catchError(this.handleError));
  }
  createAturizedStatus(status: EWM_Aturized_Status): Observable<EWM_Aturized_Status> {
    return this.http.post<EWM_Aturized_Status>(`${this.apiUrl}/EWMAturizedStatus`, status, this.httpOptions)
      .pipe(catchError(this.handleError));
  }
  updateAturizedStatus(id: number, status: EWM_Aturized_Status): Observable<EWM_Aturized_Status> {
    return this.http.put<EWM_Aturized_Status>(`${this.apiUrl}/EWMAturizedStatus/${id}`, status, this.httpOptions)
      .pipe(catchError(this.handleError));
  }
  deleteAturizedStatus(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/EWMAturizedStatus/${id}`)
      .pipe(catchError(this.handleError));
  }

  // EWM_Parck_DisplayGroupe CRUD (Added EWM_ prefix for consistency)
  getParckDisplayGroupes(): Observable<EWM_Parck_DisplayGroupe[]> {
    return this.http.get<EWM_Parck_DisplayGroupe[]>(`${this.apiUrl}/ParckDisplayGroupe`)
      .pipe(
        tap(data => console.log('API response - getParckDisplayGroupes:', data)),
        catchError(this.handleError)
      );
  }
  getParckDisplayGroupe(id: number): Observable<EWM_Parck_DisplayGroupe> {
    return this.http.get<EWM_Parck_DisplayGroupe>(`${this.apiUrl}/ParckDisplayGroupe/${id}`)
      .pipe(
        tap(data => console.log('API response - getParckDisplayGroupe:', data)),
        catchError(this.handleError)
      );
  }
  createParckDisplayGroupe(groupe: EWM_Parck_DisplayGroupe): Observable<EWM_Parck_DisplayGroupe> {
    return this.http.post<EWM_Parck_DisplayGroupe>(`${this.apiUrl}/ParckDisplayGroupe`, groupe, this.httpOptions)
      .pipe(
        tap(created => console.log('API response - createParckDisplayGroupe:', created)),
        catchError(this.handleError)
      );
  }
  updateParckDisplayGroupe(id: number, groupe: EWM_Parck_DisplayGroupe): Observable<EWM_Parck_DisplayGroupe> {
    return this.http.put<EWM_Parck_DisplayGroupe>(`${this.apiUrl}/ParckDisplayGroupe/${id}`, groupe, this.httpOptions)
      .pipe(
        tap(updated => console.log('API response - updateParckDisplayGroupe:', updated)),
        catchError(this.handleError)
      );
  }
  deleteParckDisplayGroupe(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/ParckDisplayGroupe/${id}`)
      .pipe(
        tap(() => console.log('API response - deleteParckDisplayGroupe successful for ID:', id)),
        catchError(this.handleError)
      );
  }

  // EWM_StorageBinType CRUD
  getStorageBinTypes(): Observable<EWM_StorageBinType[]> {
    return this.http.get<EWM_StorageBinType[]>(`${this.apiUrl}/StorageBinType`)
      .pipe(catchError(this.handleError));
  }
  getStorageBinType(id: number): Observable<EWM_StorageBinType> {
    return this.http.get<EWM_StorageBinType>(`${this.apiUrl}/StorageBinType/${id}`)
      .pipe(catchError(this.handleError));
  }
  createStorageBinType(type: EWM_StorageBinType): Observable<EWM_StorageBinType> {
    return this.http.post<EWM_StorageBinType>(`${this.apiUrl}/StorageBinType`, type, this.httpOptions)
      .pipe(catchError(this.handleError));
  }
  updateStorageBinType(id: number, type: EWM_StorageBinType): Observable<EWM_StorageBinType> {
    return this.http.put<EWM_StorageBinType>(`${this.apiUrl}/StorageBinType/${id}`, type, this.httpOptions)
      .pipe(catchError(this.handleError));
  }
  deleteStorageBinType(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/StorageBinType/${id}`)
      .pipe(catchError(this.handleError));
  }

  // EWM_StorageBin_Groupe CRUD (Added EWM_ for consistency)
  getStorageBinGroupes(): Observable<EWM_StorageBin_Groupe[]> {
    return this.http.get<EWM_StorageBin_Groupe[]>(`${this.apiUrl}/EWM_StorageBin_Groupe`)
      .pipe(catchError(this.handleError));
  }
  getStorageBinGroupe(id: number): Observable<EWM_StorageBin_Groupe> {
    return this.http.get<EWM_StorageBin_Groupe>(`${this.apiUrl}/EWM_StorageBin_Groupe/${id}`)
      .pipe(catchError(this.handleError));
  }
  createStorageBinGroupe(groupe: EWM_StorageBin_Groupe): Observable<EWM_StorageBin_Groupe> {
    return this.http.post<EWM_StorageBin_Groupe>(`${this.apiUrl}/EWM_StorageBin_Groupe`, groupe, this.httpOptions)
      .pipe(catchError(this.handleError));
  }
  updateStorageBinGroupe(id: number, groupe: EWM_StorageBin_Groupe): Observable<EWM_StorageBin_Groupe> {
    return this.http.put<EWM_StorageBin_Groupe>(`${this.apiUrl}/EWM_StorageBin_Groupe/${id}`, groupe, this.httpOptions)
      .pipe(catchError(this.handleError));
  }
  deleteStorageBinGroupe(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/EWM_StorageBin_Groupe/${id}`)
      .pipe(catchError(this.handleError));
  }

  // EWM_StorageType CRUD (Added EWM_ for consistency)
getStorageTypes(): Observable<EWM_StorageType[]> {
    return this.http.get<EWM_StorageType[]>(`${this.apiUrl}/StorageType`)
      .pipe(
        tap(data => console.log('API response - getStorageTypes:', data)),
        catchError(this.handleError)
      );
  }

  getStorageType(id: number): Observable<EWM_StorageType> {
    return this.http.get<EWM_StorageType>(`${this.apiUrl}/StorageType/${id}`)
      .pipe(
        tap(data => console.log('API response - getStorageType:', data)),
        catchError(this.handleError)
      );
  }

  createStorageType(type: EWM_StorageType): Observable<EWM_StorageType> {
    return this.http.post<EWM_StorageType>(`${this.apiUrl}/StorageType`, type, this.httpOptions)
      .pipe(
        tap(created => console.log('API response - createStorageType:', created)),
        catchError(this.handleError)
      );
  }

  updateStorageType(id: number, type: EWM_StorageType): Observable<EWM_StorageType> {
    return this.http.put<EWM_StorageType>(`${this.apiUrl}/StorageType/${id}`, type, this.httpOptions)
      .pipe(
        tap(updated => console.log('API response - updateStorageType:', updated)),
        catchError(this.handleError)
      );
  }

  deleteStorageType(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/StorageType/${id}`)
      .pipe(
        tap(() => console.log('API response - deleteStorageType successful for ID:', id)),
        catchError(this.handleError)
      );
  }

  getAturizedStatusesFromStorageType(): Observable<EWM_Aturized_Status[]> {
    return this.http.get<EWM_Aturized_Status[]>(`${this.apiUrl}/EWMAturizedStatus`)
      .pipe(
        tap(data => console.log('API response - getAturizedStatuses:', data)),
        catchError(this.handleError)
      );
  }


  // EWM_StorageType_Rules CRUD (Added EWM_ for consistency)
  getStorageTypeRules(): Observable<EWM_StorageType_Rules[]> {
    return this.http.get<EWM_StorageType_Rules[]>(`${this.apiUrl}/StorageTypeRules`)
      .pipe(catchError(this.handleError));
  }
  getStorageTypeRule(id: number): Observable<EWM_StorageType_Rules> {
    return this.http.get<EWM_StorageType_Rules>(`${this.apiUrl}/StorageTypeRules/${id}`)
      .pipe(catchError(this.handleError));
  }
  createStorageTypeRule(rule: EWM_StorageType_Rules): Observable<EWM_StorageType_Rules> {
    return this.http.post<EWM_StorageType_Rules>(`${this.apiUrl}/StorageTypeRules`, rule, this.httpOptions)
      .pipe(catchError(this.handleError));
  }
  updateStorageTypeRule(id: number, rule: EWM_StorageType_Rules): Observable<EWM_StorageType_Rules> {
    return this.http.put<EWM_StorageType_Rules>(`${this.apiUrl}/StorageTypeRules/${id}`, rule, this.httpOptions)
      .pipe(catchError(this.handleError));
  }
  deleteStorageTypeRule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/StorageTypeRules/${id}`)
      .pipe(catchError(this.handleError));
  }

  getStorageTypeRuless(): Observable<StorageTypeRuleResponseDTO[]> {
  return this.http.get<StorageTypeRuleResponseDTO[]>(`${this.apiUrl}/StorageTypeRules`)
    .pipe(catchError(this.handleError));
}

getStorageTypeRulee(id: number): Observable<StorageTypeRuleResponseDTO> {
  return this.http.get<StorageTypeRuleResponseDTO>(`${this.apiUrl}/StorageTypeRules/${id}`)
    .pipe(catchError(this.handleError));
}

createStorageTypeRulee(rule: StorageTypeRuleCreateDTO): Observable<StorageTypeRuleResponseDTO> {
  return this.http.post<StorageTypeRuleResponseDTO>(`${this.apiUrl}/StorageTypeRules`, rule, this.httpOptions)
    .pipe(catchError(this.handleError));
}

updateStorageTypeRulee(id: number, rule: StorageTypeRuleCreateDTO): Observable<StorageTypeRuleResponseDTO> {
  return this.http.put<StorageTypeRuleResponseDTO>(`${this.apiUrl}/StorageTypeRules/${id}`, rule, this.httpOptions)
    .pipe(catchError(this.handleError));
}

deleteStorageTypeRulee(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/StorageTypeRules/${id}`)
    .pipe(catchError(this.handleError));
}
  // EWM_StorageBin CRUD (Added EWM_ for consistency)
  getStorageBins(): Observable<EWM_StorageBin[]> {
    return this.http.get<EWM_StorageBin[]>(`${this.apiUrl}/EWM_StorageBin`)
      .pipe(catchError(this.handleError));
  }
  getStorageBin(id: number): Observable<EWM_StorageBin> {
    return this.http.get<EWM_StorageBin>(`${this.apiUrl}/EWM_StorageBin/${id}`)
      .pipe(catchError(this.handleError));
  }
  createStorageBin(bin: EWM_StorageBin): Observable<EWM_StorageBin> {
    return this.http.post<EWM_StorageBin>(`${this.apiUrl}/EWM_StorageBin`, bin, this.httpOptions)
      .pipe(catchError(this.handleError));
  }
  updateStorageBin(id: number, bin: EWM_StorageBin): Observable<EWM_StorageBin> {
    return this.http.put<EWM_StorageBin>(`${this.apiUrl}/EWM_StorageBin/${id}`, bin, this.httpOptions)
      .pipe(catchError(this.handleError));
  }
  deleteStorageBin(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/EWM_StorageBin/${id}`)
      .pipe(catchError(this.handleError));
  }
  assignHandlingUnitToBin(binId: number, unitId: number): Observable<void> {
  return this.http.put<void>(`${this.apiUrl}/EWM_StorageBin/${binId}/handlingunits/${unitId}`, {}, this.httpOptions)
    .pipe(catchError(this.handleError));
}


  // EWM_StorageBin_Rules CRUD (Added EWM_ for consistency)
  getStorageBinRules(): Observable<EWM_StorageBin_Rules[]> {
    return this.http.get<EWM_StorageBin_Rules[]>(`${this.apiUrl}/StorageBinRules`)
      .pipe(catchError(this.handleError));
  }
  getStorageBinRule(id: number): Observable<EWM_StorageBin_Rules> {
    return this.http.get<EWM_StorageBin_Rules>(`${this.apiUrl}/StorageBinRules/${id}`)
      .pipe(catchError(this.handleError));
  }
  createStorageBinRule(rule: EWM_StorageBin_Rules): Observable<EWM_StorageBin_Rules> {
    return this.http.post<EWM_StorageBin_Rules>(`${this.apiUrl}/StorageBinRules`, rule, this.httpOptions)
      .pipe(catchError(this.handleError));
  }
  updateStorageBinRule(id: number, rule: EWM_StorageBin_Rules): Observable<EWM_StorageBin_Rules> {
    return this.http.put<EWM_StorageBin_Rules>(`${this.apiUrl}/StorageBinRules/${id}`, rule, this.httpOptions)
      .pipe(catchError(this.handleError));
  }
  deleteStorageBinRule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/StorageBinRules/${id}`)
      .pipe(catchError(this.handleError));
  }

  // EWM_StorageBin_Details CRUD (Added EWM_ for consistency)
  getStorageBinDetails(): Observable<EWM_StorageBin_Details[]> {
    return this.http.get<EWM_StorageBin_Details[]>(`${this.apiUrl}/StorageBinDetails`)
      .pipe(catchError(this.handleError));
  }
  getStorageBinDetail(id: number): Observable<EWM_StorageBin_Details> {
    return this.http.get<EWM_StorageBin_Details>(`${this.apiUrl}/StorageBinDetails/${id}`)
      .pipe(catchError(this.handleError));
  }
  createStorageBinDetail(detail: EWM_StorageBin_Details): Observable<EWM_StorageBin_Details> {
    return this.http.post<EWM_StorageBin_Details>(`${this.apiUrl}/StorageBinDetails`, detail, this.httpOptions)
      .pipe(catchError(this.handleError));
  }
  updateStorageBinDetail(id: number, detail: EWM_StorageBin_Details): Observable<EWM_StorageBin_Details> {
    return this.http.put<EWM_StorageBin_Details>(`${this.apiUrl}/StorageBinDetails/${id}`, detail, this.httpOptions)
      .pipe(catchError(this.handleError));
  }
  deleteStorageBinDetail(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/StorageBinDetails/${id}`)
      .pipe(catchError(this.handleError));
  }

  // HandlingUnit CRUD
  getHandlingUnits(): Observable<HandlingUnit[]> {
    return this.http.get<HandlingUnit[]>(`${this.apiUrl}/HandlingUnit`)
      .pipe(catchError(this.handleError));
  }
  getHandlingUnit(id: number): Observable<HandlingUnit> {
    return this.http.get<HandlingUnit>(`${this.apiUrl}/HandlingUnit/${id}`)
      .pipe(catchError(this.handleError));
  }
  createHandlingUnit(unit: HandlingUnit): Observable<HandlingUnit> {
    return this.http.post<HandlingUnit>(`${this.apiUrl}/HandlingUnit`, unit, this.httpOptions)
      .pipe(catchError(this.handleError));
  }
  updateHandlingUnit(id: number, unit: HandlingUnit): Observable<HandlingUnit> {
    return this.http.put<HandlingUnit>(`${this.apiUrl}/HandlingUnit/${id}`, unit, this.httpOptions)
      .pipe(catchError(this.handleError));
  }
  deleteHandlingUnit(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/HandlingUnit/${id}`)
      .pipe(catchError(this.handleError));
  }
  getHandlingUnitTransactions(id: number): Observable<StockMovement[]> {
  return this.http.get<StockMovement[]>(`${this.apiUrl}/handlingunit/${id}/transactions`);
}

  // StockMovement CRUD
  getStockMovements(): Observable<StockMovement[]> {
    return this.http.get<StockMovement[]>(`${this.apiUrl}/StockMovement`)
      .pipe(catchError(this.handleError));
  }
  getStockMovement(id: number): Observable<StockMovement> {
    return this.http.get<StockMovement>(`${this.apiUrl}/StockMovement/${id}`)
      .pipe(catchError(this.handleError));
  }
  createStockMovement(movement: StockMovement): Observable<StockMovement> {
    return this.http.post<StockMovement>(`${this.apiUrl}/StockMovement`, movement, this.httpOptions)
      .pipe(catchError(this.handleError));
  }
  updateStockMovement(id: number, movement: StockMovement): Observable<StockMovement> {
    return this.http.put<StockMovement>(`${this.apiUrl}/StockMovement/${id}`, movement, this.httpOptions)
      .pipe(catchError(this.handleError));
  }
  deleteStockMovement(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/StockMovement/${id}`)
      .pipe(catchError(this.handleError));
  }
  
  // WorkCenter CRUD
  getWorkCenters(): Observable<WorkCenterDto[]> {
    return this.http.get<WorkCenterDto[]>(`${this.mescoFiApiUrl}/WorkCenter`)
      .pipe(
        tap(data => console.log('API response - getWorkCenters:', data)),
        catchError(this.handleError)
      );
  }
  getWorkCenter(id: number): Observable<WorkCenterDto> {
    return this.http.get<WorkCenterDto>(`${this.mescoFiApiUrl}/WorkCenter/${id}`)
      .pipe(
        tap(data => console.log('API response - getWorkCenter:', data)),
        catchError(this.handleError)
      );
  }
  createWorkCenter(dto: CreateWorkCenterDto): Observable<WorkCenterDto> {
    return this.http.post<WorkCenterDto>(`${this.mescoFiApiUrl}/WorkCenter`, dto, this.httpOptions)
      .pipe(
        tap(created => console.log('API response - createWorkCenter:', created)),
        catchError(this.handleError)
      );
  }
  updateWorkCenter(id: number, dto: UpdateWorkCenterDto): Observable<WorkCenterDto> {
    return this.http.put<WorkCenterDto>(`${this.mescoFiApiUrl}/WorkCenter/${id}`, dto, this.httpOptions)
      .pipe(
        tap(updated => console.log('API response - updateWorkCenter:', updated)),
        catchError(this.handleError)
      );
  }
  deleteWorkCenter(id: number): Observable<void> {
    return this.http.delete<void>(`${this.mescoFiApiUrl}/WorkCenter/${id}`)
      .pipe(
        tap(() => console.log('API response - deleteWorkCenter successful for ID:', id)),
        catchError(this.handleError)
      );
  }

  //////////////
  // src/app/shared/services/api.service.ts (Add these methods)
// src/app/shared/services/api.service.ts (Updated for Characteristic methods)
// Change create, update, delete to Observable<any> to handle string responses
// Keep get as CharacteristicDto[]
// Added logs remain

getCharacteristics(): Observable<CharacteristicDto[]> {
  console.log('Fetching all characteristics from API');
  return this.http.get<CharacteristicDto[]>(`${this.mescoFiApiUrl}/Characteristics`).pipe(
    tap({
      next: (data) => console.log('Fetched characteristics:', data),
      error: (err) => console.error('Fetch characteristics failed:', err)
    })
  );
}

createCharacteristic(dto: CreateCharacteristicDto): Observable<any> { // Changed to any
  console.log('Creating characteristic:', dto);
  return this.http.post<any>(`${this.mescoFiApiUrl}/Characteristics`, dto, this.httpOptions).pipe(
    tap({
      next: (response) => console.log('Create successful:', response), // Logs "Characteristic created"
      error: (err) => console.error('Create failed:', err)
    })
  );
}

updateCharacteristic(id: number, dto: UpdateCharacteristicDto): Observable<any> { // Changed to any
  console.log('Updating characteristic ID:', id, 'with:', dto);
  return this.http.put<any>(`${this.mescoFiApiUrl}/Characteristics/${id}`, dto, this.httpOptions).pipe(
    tap({
      next: (response) => console.log('Update successful:', response), // Logs "Characteristic updated"
      error: (err) => console.error('Update failed:', err)
    })
  );
}

deleteCharacteristic(id: number): Observable<any> { // Changed to any
  console.log('Deleting characteristic ID:', id);
  return this.http.delete<any>(`${this.mescoFiApiUrl}/Characteristics/${id}`).pipe(
    tap({
      next: (response) => console.log('Delete successful for ID:', id, response), // Logs "Characteristic deleted"
      error: (err) => console.error('Delete failed for ID:', id, 'Error:', err)
    })
  );
}
// NEW: Classification CRUD methods (similar to WorkCenter, using mescoFiApiUrl assuming it's the same backend)
  getClassifications(): Observable<ClassificationDto[]> {
    return this.http.get<ClassificationDto[]>(`${this.mescoFiApiUrl}/Classification`)
      .pipe(
        tap(data => console.log('API response - getClassifications:', data)),
        catchError(this.handleError)
      );
  }

  getClassification(id: number): Observable<ClassificationDto> {
    return this.http.get<ClassificationDto>(`${this.mescoFiApiUrl}/Classification/${id}`)
      .pipe(
        tap(data => console.log('API response - getClassification:', data)),
        catchError(this.handleError)
      );
  }

  createClassification(dto: CreateClassificationDto): Observable<ClassificationDto> {
    return this.http.post<ClassificationDto>(`${this.mescoFiApiUrl}/Classification`, dto, this.httpOptions)
      .pipe(
        tap(created => console.log('API response - createClassification:', created)),
        catchError(this.handleError)
      );
  }

  updateClassification(id: number, dto: CreateClassificationDto): Observable<ClassificationDto> { // Using CreateDto as per controller (no separate UpdateDto)
    return this.http.put<ClassificationDto>(`${this.mescoFiApiUrl}/Classification/${id}`, dto, this.httpOptions)
      .pipe(
        tap(updated => console.log('API response - updateClassification:', updated)),
        catchError(this.handleError)
      );
  }

  deleteClassification(id: number): Observable<void> {
    return this.http.delete<void>(`${this.mescoFiApiUrl}/Classification/${id}`)
      .pipe(
        tap(() => console.log('API response - deleteClassification successful for ID:', id)),
        catchError(this.handleError)
      );
  }

  // NEW: Assign and Remove Characteristic (using characteristicNumber as string)
  assignCharacteristic(classificationId: number, characteristicId: number): Observable<void> {
    return this.http.post<void>(`${this.mescoFiApiUrl}/Classification/${classificationId}/assign-characteristic/${characteristicId}`, {}, this.httpOptions)
      .pipe(
        tap(() => console.log('API response - assignCharacteristic successful')),
        catchError(this.handleError)
      );
  }

  removeCharacteristic(classificationId: number, characteristicId: number): Observable<void> {
    return this.http.delete<void>(`${this.mescoFiApiUrl}/Classification/${classificationId}/remove-characteristic/${characteristicId}`)
      .pipe(
        tap(() => console.log('API response - removeCharacteristic successful')),
        catchError(this.handleError)
      );
  }

  // Add these to the end of api.service.ts

// ControlModel CRUD
getControlModels(): Observable<ControlModelDto[]> {
  console.log('Fetching all control models from API');
  return this.http.get<ControlModelDto[]>(`${this.mescoFiApiUrl}/ControlModels`).pipe(
    tap({
      next: (data) => console.log('Fetched control models:', data),
      error: (err) => console.error('Fetch control models failed:', err)
    })
  );
}

getControlModel(id: number): Observable<ControlModelDto> {
  console.log('Fetching control model ID:', id);
  return this.http.get<ControlModelDto>(`${this.mescoFiApiUrl}/ControlModels/${id}`).pipe(
    tap({
      next: (data) => console.log('Fetched control model:', data),
      error: (err) => console.error('Fetch control model failed:', err)
    })
  );
}

createControlModel(dto: CreateControlModelDto): Observable<any> {
  console.log('Creating control model:', dto);
  return this.http.post<any>(`${this.mescoFiApiUrl}/ControlModels`, dto, this.httpOptions).pipe(
    tap({
      next: (response) => console.log('Create control model successful:', response),
      error: (err) => console.error('Create control model failed:', err)
    })
  );
}

updateControlModel(id: number, dto: UpdateControlModelDto): Observable<any> {
  console.log('Updating control model ID:', id, 'with:', dto);
  return this.http.put<any>(`${this.mescoFiApiUrl}/ControlModels/${id}`, dto, this.httpOptions).pipe(
    tap({
      next: (response) => console.log('Update control model successful:', response),
      error: (err) => console.error('Update control model failed:', err)
    })
  );
}

deleteControlModel(id: number): Observable<any> {
  console.log('Deleting control model ID:', id);
  return this.http.delete<any>(`${this.mescoFiApiUrl}/ControlModels/${id}`).pipe(
    tap({
      next: (response) => console.log('Delete control model successful:', response),
      error: (err) => console.error('Delete control model failed:', err)
    })
  );
}

// Additional actions
addCharacteristicToControlModel(controlModelId: number, characteristicId: number): Observable<any> {
  console.log('Adding characteristic ID:', characteristicId, 'to control model ID:', controlModelId);
  return this.http.post<any>(`${this.mescoFiApiUrl}/ControlModels/${controlModelId}/add-characteristic/${characteristicId}`, {}, this.httpOptions).pipe(
    tap({
      next: (response) => console.log('Add characteristic successful:', response),
      error: (err) => console.error('Add characteristic failed:', err)
    })
  );
}

removeCharacteristicFromControlModel(controlModelId: number, characteristicId: number): Observable<any> {
  console.log('Removing characteristic ID:', characteristicId, 'from control model ID:', controlModelId);
  return this.http.delete<any>(`${this.mescoFiApiUrl}/ControlModels/${controlModelId}/remove-characteristic/${characteristicId}`).pipe(
    tap({
      next: (response) => console.log('Remove characteristic successful:', response),
      error: (err) => console.error('Remove characteristic failed:', err)
    })
  );
}

addMaterialToControlModel(controlModelId: number, materialId: number): Observable<any> {
  console.log('Adding material ID:', materialId, 'to control model ID:', controlModelId);
  return this.http.post<any>(`${this.mescoFiApiUrl}/ControlModels/${controlModelId}/assign-material/${materialId}`, {}, this.httpOptions).pipe(
    tap({
      next: (response) => console.log('Add material successful:', response),
      error: (err) => console.error('Add material failed:', err)
    })
  );
}

removeMaterialFromControlModel(controlModelId: number, materialId: number): Observable<any> {
  console.log('Removing material ID:', materialId, 'from control model ID:', controlModelId);
  return this.http.delete<any>(`${this.mescoFiApiUrl}/ControlModels/${controlModelId}/remove-material/${materialId}`).pipe(
    tap({
      next: (response) => console.log('Remove material successful:', response),
      error: (err) => console.error('Remove material failed:', err)
    })
  );
}


// Add these to the end of api.service.ts

// Material CRUD and actions


  assignControlModelToMaterial(materialId: number, controlModelId: number): Observable<any> {
    console.log('Assigning control model ID:', controlModelId, 'to material ID:', materialId);
    return this.http.post<any>(`${this.mescoFiApiUrl}/Material/${materialId}/assign-control-model/${controlModelId}`, {}, this.httpOptions).pipe(
      tap({
        next: (response) => console.log('Assign control model successful:', response),
        error: (err) => console.error('Assign control model failed:', err)
      })
    );
  }

  removeControlModelFromMaterial(materialId: number, controlModelId: number): Observable<any> {
    console.log('Removing control model ID:', controlModelId, 'from material ID:', materialId);
    return this.http.delete<any>(`${this.mescoFiApiUrl}/Material/${materialId}/remove-control-model/${controlModelId}`).pipe(
      tap({
        next: (response) => console.log('Remove control model successful:', response),
        error: (err) => console.error('Remove control model failed:', err)
      })
    );
  }

  getMaterialsByCharacteristic(characteristicId: number): Observable<MaterialDto[]> { // Assuming MaterialDto
    console.log('Fetching materials by characteristic ID:', characteristicId);
    return this.http.get<MaterialDto[]>(`${this.mescoFiApiUrl}/ControlModels/materials-by-characteristic/${characteristicId}`).pipe(
      tap({
        next: (data) => console.log('Fetched materials:', data),
        error: (err) => console.error('Fetch materials by characteristic failed:', err)
      })
    );
  }

  createControlModelWithMaterials(dto: CreateControlModelWithMaterialsDto): Observable<any> {
    console.log('Creating control model with materials:', dto);
    return this.http.post<any>(`${this.mescoFiApiUrl}/ControlModels/create-with-materials`, dto, this.httpOptions).pipe(
      tap({
        next: (response) => console.log('Create with materials successful:', response),
        error: (err) => console.error('Create with materials failed:', err)
      })
    );
  }
  // Add these to the end of api.service.ts

  
  ///////////
  // Material CRUD and actions
  getMaterials(): Observable<MaterialDto[]> {
    console.log('Fetching all materials from API');
    return this.http.get<MaterialDto[]>(`${this.mescoFiApiUrl}/Material`).pipe(
      tap({
        next: (data) => console.log('Fetched materials:', data),
        error: (err) => console.error('Fetch materials failed:', err)
      })
    );
  }

  getMaterial(id: number): Observable<MaterialDto> {
    console.log('Fetching material ID:', id);
    return this.http.get<MaterialDto>(`${this.mescoFiApiUrl}/Material/${id}`).pipe(
      tap({
        next: (data) => console.log('Fetched material:', data),
        error: (err) => console.error('Fetch material failed:', err)
      })
    );
  }

  createMaterial(dto: CreateMaterialDto): Observable<any> {
    console.log('Creating material:', dto);
    return this.http.post<any>(`${this.mescoFiApiUrl}/Material`, dto, this.httpOptions).pipe(
      tap({
        next: (response) => console.log('Create material successful:', response),
        error: (err) => console.error('Create material failed:', err)
      })
    );
  }

  updateMaterial(id: number, dto: CreateMaterialDto): Observable<any> { // Uses CreateDto as per controller
    console.log('Updating material ID:', id, 'with:', dto);
    return this.http.put<any>(`${this.mescoFiApiUrl}/Material/${id}`, dto, this.httpOptions).pipe(
      tap({
        next: (response) => console.log('Update material successful:', response),
        error: (err) => console.error('Update material failed:', err)
      })
    );
  }

  deleteMaterial(id: number): Observable<any> {
    console.log('Deleting material ID:', id);
    return this.http.delete<any>(`${this.mescoFiApiUrl}/Material/${id}`).pipe(
      tap({
        next: (response) => console.log('Delete material successful:', response),
        error: (err) => console.error('Delete material failed:', err)
      })
    );
  }

  // Classify action
  classifyMaterial(materialId: number, classificationId: number): Observable<any> {
    console.log('Classifying material ID:', materialId, 'with classification ID:', classificationId);
    return this.http.post<any>(`${this.mescoFiApiUrl}/Material/${materialId}/classify?classNumber=${classificationId}`, {}, this.httpOptions).pipe(
      tap({
        next: (response) => console.log('Classify successful:', response),
        error: (err) => console.error('Classify failed:', err)
      })
    );
  }

  // Set principal control model
  setPrincipalControlModel(materialId: number, controlModelId: number): Observable<any> {
    console.log('Setting principal control model ID:', controlModelId, 'for material ID:', materialId);
    return this.http.put<any>(`${this.mescoFiApiUrl}/Material/${materialId}/set-principal-control-model/${controlModelId}`, {}, this.httpOptions).pipe(
      tap({
        next: (response) => console.log('Set principal successful:', response),
        error: (err) => console.error('Set principal failed:', err)
      })
    );
  }

  // New methods for Characteristic Assignments
  getAllCharacteristicAssignments(): Observable<CharacteristicAssignment[]> {
    console.log('Fetching all characteristic assignments');
    return this.http.get<CharacteristicAssignment[]>(`${this.mescoFiApiUrl}/CharacteristicAssignment`).pipe(
      tap({
        next: (data) => console.log('Fetched assignments:', data),
        error: (err) => console.error('Fetch assignments failed:', err)
      })
    );
  }

  getCharacteristicAssignmentById(id: number): Observable<CharacteristicAssignment> {
    console.log('Fetching assignment ID:', id);
    return this.http.get<CharacteristicAssignment>(`${this.mescoFiApiUrl}/CharacteristicAssignment/${id}`).pipe(
      tap({
        next: (data) => console.log('Fetched assignment:', data),
        error: (err) => console.error('Fetch assignment failed:', err)
      })
    );
  }

  createCharacteristicAssignment(assignment: CharacteristicAssignment): Observable<CharacteristicAssignment> {
    console.log('Sending JSON for create assignment:', assignment);
    return this.http.post<CharacteristicAssignment>(`${this.mescoFiApiUrl}/CharacteristicAssignment`, assignment, this.httpOptions).pipe(
      tap({
        next: (response) => console.log('Create assignment successful, response JSON:', response),
        error: (err) => console.error('Create assignment failed:', err)
      })
    );
  }

  updateCharacteristicAssignment(id: number, assignment: CharacteristicAssignment): Observable<void> {
    console.log('Sending JSON for update assignment ID:', id, 'with:', assignment);
    return this.http.put<void>(`${this.mescoFiApiUrl}/CharacteristicAssignment/${id}`, assignment, this.httpOptions).pipe(
      tap({
        next: (response) => console.log('Update assignment successful, response JSON:', response),
        error: (err) => console.error('Update assignment failed:', err)
      })
    );
  }

  deleteCharacteristicAssignment(id: number): Observable<void> {
    console.log('Deleting assignment ID:', id);
    return this.http.delete<void>(`${this.mescoFiApiUrl}/CharacteristicAssignment/${id}`).pipe(
      tap({
        next: (response) => console.log('Delete assignment successful:', response),
        error: (err) => console.error('Delete assignment failed:', err)
      })
    );
  }

  getAssignmentsByMaterialId(materialId: number): Observable<CharacteristicAssignment[]> {
    console.log('Fetching assignments for material ID:', materialId);
    return this.http.get<CharacteristicAssignment[]>(`${this.mescoFiApiUrl}/CharacteristicAssignment/material/${materialId}`).pipe(
      tap({
        next: (data) => console.log('Fetched assignments for material:', data),
        error: (err) => console.error('Fetch assignments by material failed:', err)
      })
    );
  }

  // Assume these exist or add if needed for materials and characteristics
  getAllMaterials(): Observable<MaterialDto[]> {
    console.log('Fetching all materials');
    return this.http.get<MaterialDto[]>(`${this.mescoFiApiUrl}/Material`).pipe(
      tap({
        next: (data) => console.log('Fetched all materials:', data),
        error: (err) => console.error('Fetch all materials failed:', err)
      })
    );
  }

  getAllCharacteristics(): Observable<CharacteristicDto[]> {
    console.log('Fetching all characteristics');
    return this.http.get<CharacteristicDto[]>(`${this.mescoFiApiUrl}/Characteristics`).pipe(
      tap({
        next: (data) => console.log('Fetched all characteristics:', data),
        error: (err) => console.error('Fetch all characteristics failed:', err)
      })
    );
  }
  ////////////
  // Event methods
 

  getEventById(id: number): Observable<EventDto> {
    console.log('Fetching event ID:', id);
    return this.http.get<EventDto>(`${this.mescoFiApiUrl}/Events/${id}`).pipe(
      tap({
        next: (data) => console.log('Fetched event:', data),
        error: (err) => console.error('Fetch event failed:', err)
      }),
      catchError(this.handleError)
    );
  }

updateEvent(id: number, dto: UpdateEventDto): Observable<void> {
  console.log('Before send update:', JSON.stringify(dto));  // Log as requested
  return this.http.put<void>(`${this.mescoFiApiUrl}/Events/${id}`, dto, this.httpOptions).pipe(
    tap({
      next: () => console.log('After send update success'),
      error: (err) => console.error('Update event failed:', err)
    }),
    catchError(this.handleError)
  );
}

// For createEvent, already has logs, but add JSON
createEvent(dto: CreateEventDto): Observable<EventDto> {
  console.log('Before send create:', JSON.stringify(dto));
  return this.http.post<EventDto>(`${this.mescoFiApiUrl}/Events`, dto, this.httpOptions).pipe(
    tap({
      next: (response) => console.log('After send create response:', JSON.stringify(response)),
      error: (err) => console.error('Create event failed:', err)
    }),
    catchError(this.handleError)
  );
}

// For getAllEvents, add log
getAllEvents(): Observable<EventDto[]> {
  return this.http.get<EventDto[]>(`${this.mescoFiApiUrl}/Events`).pipe(
    tap({
      next: (data) => console.log('Loaded JSON from backend:', JSON.stringify(data)),
      error: (err) => console.error('Fetch all events failed:', err)
    }),
    catchError(this.handleError)
  );
}



  deleteEvent(id: number): Observable<void> {
    console.log('Deleting event ID:', id);
    return this.http.delete<void>(`${this.mescoFiApiUrl}/Events/${id}`).pipe(
      tap({
        next: () => console.log('Delete event successful'),
        error: (err) => console.error('Delete event failed:', err)
      }),
      catchError(this.handleError)
    );
  }

  addCharacteristicToEvent(eventId: number, characteristicId: number): Observable<any> {
    console.log('Adding characteristic ID:', characteristicId, 'to event ID:', eventId);
    return this.http.post<any>(`${this.mescoFiApiUrl}/Events/${eventId}/add-characteristic/${characteristicId}`, {}, this.httpOptions).pipe(
      tap({
        next: (response) => console.log('Add characteristic successful:', response),
        error: (err) => console.error('Add characteristic failed:', err)
      }),
      catchError(this.handleError)
    );
  }

  removeCharacteristicFromEvent(eventId: number, characteristicId: number): Observable<any> {
    console.log('Removing characteristic ID:', characteristicId, 'from event ID:', eventId);
    return this.http.delete<any>(`${this.mescoFiApiUrl}/Events/${eventId}/remove-characteristic/${characteristicId}`).pipe(
      tap({
        next: (response) => console.log('Remove characteristic successful:', response),
        error: (err) => console.error('Remove characteristic failed:', err)
      }),
      catchError(this.handleError)
    );
  }

  getAllBOMs(): Observable<BOMDto[]> {
  console.log('Fetching all BOMs');
  return this.http.get<BOMDto[]>(`${this.mescoFiApiUrl}/BOM`).pipe(
    tap({
      next: (data) => console.log('Loaded BOMs from backend:', JSON.stringify(data)),
      error: (err) => console.error('Fetch all BOMs failed:', err)
    }),
    catchError(this.handleError)
  );
}

getBOMById(id: number): Observable<BOMDto> {
  console.log('Fetching BOM ID:', id);
  return this.http.get<BOMDto>(`${this.mescoFiApiUrl}/BOM/${id}`).pipe(
    tap({
      next: (data) => console.log('Fetched BOM:', data),
      error: (err) => console.error('Fetch BOM failed:', err)
    }),
    catchError(this.handleError)
  );
}

createBOM(dto: CreateBOMDto): Observable<BOMDto> {
  console.log('Before send create BOM:', JSON.stringify(dto));
  return this.http.post<BOMDto>(`${this.mescoFiApiUrl}/BOM`, dto, this.httpOptions).pipe(
    tap({
      next: (response) => console.log('After send create BOM response:', JSON.stringify(response)),
      error: (err) => console.error('Create BOM failed:', err)
    }),
    catchError(this.handleError)
  );
}

updateBOM(id: number, dto: CreateBOMDto): Observable<void> {
  console.log('Before send update BOM:', JSON.stringify(dto));
  return this.http.put<void>(`${this.mescoFiApiUrl}/BOM/${id}`, dto, this.httpOptions).pipe(
    tap({
      next: () => console.log('After send update BOM success'),
      error: (err) => console.error('Update BOM failed:', err)
    }),
    catchError(this.handleError)
  );
}

deleteBOM(id: number): Observable<void> {
  console.log('Deleting BOM ID:', id);
  return this.http.delete<void>(`${this.mescoFiApiUrl}/BOM/${id}`).pipe( // Add DELETE endpoint in backend if missing
    tap({
      next: () => console.log('Delete BOM successful'),
      error: (err) => console.error('Delete BOM failed:', err)
    }),
    catchError(this.handleError)
  );
}

addMaterialToBOM(bomId: number, materialId: number): Observable<any> {
  console.log('Adding material ID:', materialId, 'to BOM ID:', bomId);
  return this.http.post<any>(`${this.mescoFiApiUrl}/BOM/${bomId}/materials/${materialId}`, {}, this.httpOptions).pipe(
    tap({
      next: (response) => console.log('Add material successful:', response),
      error: (err) => console.error('Add material failed:', err)
    }),
    catchError(this.handleError)
  );
}

removeMaterialFromBOM(bomId: number, materialId: number): Observable<any> {
  console.log('Removing material ID:', materialId, 'from BOM ID:', bomId);
  return this.http.delete<any>(`${this.mescoFiApiUrl}/BOM/${bomId}/materials/${materialId}`).pipe(
    tap({
      next: (response) => console.log('Remove material successful:', response),
      error: (err) => console.error('Remove material failed:', err)
    }),
    catchError(this.handleError)
  );
}

getAllRoutings(): Observable<RoutingDto[]> {
  console.log('Fetching all routings');
  return this.http.get<RoutingDto[]>(`${this.mescoFiApiUrl}/Routing`).pipe(
    tap({
      next: (data) => console.log('Loaded routings from backend:', JSON.stringify(data)),
      error: (err) => console.error('Fetch all routings failed:', err)
    }),
    catchError(this.handleError)
  );
}

getRoutingById(id: number): Observable<RoutingDto> {
  console.log('Fetching routing ID:', id);
  return this.http.get<RoutingDto>(`${this.mescoFiApiUrl}/Routing/${id}`).pipe(
    tap({
      next: (data) => console.log('Fetched routing:', data),
      error: (err) => console.error('Fetch routing failed:', err)
    }),
    catchError(this.handleError)
  );
}

createRouting(dto: CreateRoutingDto): Observable<RoutingDto> {
  console.log('Before send create routing:', JSON.stringify(dto));
  return this.http.post<RoutingDto>(`${this.mescoFiApiUrl}/Routing`, dto, this.httpOptions).pipe(
    tap({
      next: (response) => console.log('After send create routing response:', JSON.stringify(response)),
      error: (err) => console.error('Create routing failed:', err)
    }),
    catchError(this.handleError)
  );
}

updateRouting(id: number, dto: CreateRoutingDto): Observable<void> {
  console.log('Before send update routing:', JSON.stringify(dto));
  return this.http.put<void>(`${this.mescoFiApiUrl}/Routing/${id}`, dto, this.httpOptions).pipe(
    tap({
      next: () => console.log('After send update routing success'),
      error: (err) => console.error('Update routing failed:', err)
    }),
    catchError(this.handleError)
  );
}

deleteRouting(id: number): Observable<void> {
  console.log('Deleting routing ID:', id);
  return this.http.delete<void>(`${this.mescoFiApiUrl}/Routing/${id}`).pipe(
    tap({
      next: () => console.log('Delete routing successful'),
      error: (err) => console.error('Delete routing failed:', err)
    }),
    catchError(this.handleError)
  );
}

addWorkCenterToRouting(routingId: number, workCenterId: number): Observable<any> {
  console.log('Adding work center ID:', workCenterId, 'to routing ID:', routingId);
  return this.http.post<any>(`${this.mescoFiApiUrl}/Routing/${routingId}/workcenter/${workCenterId}`, {}, this.httpOptions).pipe(
    tap({
      next: (response) => console.log('Add work center successful:', response),
      error: (err) => console.error('Add work center failed:', err)
    }),
    catchError(this.handleError)
  );
}

removeWorkCenterFromRouting(routingId: number, workCenterId: number): Observable<any> {
  console.log('Removing work center ID:', workCenterId, 'from routing ID:', routingId);
  return this.http.delete<any>(`${this.mescoFiApiUrl}/Routing/${routingId}/workcenter/${workCenterId}`).pipe(
    tap({
      next: (response) => console.log('Remove work center successful:', response),
      error: (err) => console.error('Remove work center failed:', err)
    }),
    catchError(this.handleError)
  );
}

// ... existing imports ...


// Inside ApiService class:

getAllProductionVersions(): Observable<ProductionVersionDto[]> {
  console.log('Fetching all production versions');
  return this.http.get<ProductionVersionDto[]>(`${this.mescoFiApiUrl}/ProductionVersion`).pipe(
    tap({
      next: (data) => console.log('Loaded production versions from backend:', JSON.stringify(data)),
      error: (err) => console.error('Fetch all production versions failed:', err)
    }),
    catchError(this.handleError)
  );
}

getProductionVersionById(id: number): Observable<ProductionVersionDto> {
  console.log('Fetching production version ID:', id);
  return this.http.get<ProductionVersionDto>(`${this.mescoFiApiUrl}/ProductionVersion/${id}`).pipe(
    tap({
      next: (data) => console.log('Fetched production version:', data),
      error: (err) => console.error('Fetch production version failed:', err)
    }),
    catchError(this.handleError)
  );
}

createProductionVersion(dto: CreateProductionVersionDto): Observable<ProductionVersionDto> {
  console.log('Before send create production version:', JSON.stringify(dto));
  return this.http.post<ProductionVersionDto>(`${this.mescoFiApiUrl}/ProductionVersion`, dto, this.httpOptions).pipe(
    tap({
      next: (response) => console.log('After send create production version response:', JSON.stringify(response)),
      error: (err) => console.error('Create production version failed:', err)
    }),
    catchError(this.handleError)
  );
}

updateProductionVersion(id: number, dto: CreateProductionVersionDto): Observable<void> {
  console.log('Before send update production version:', JSON.stringify(dto));
  return this.http.put<void>(`${this.mescoFiApiUrl}/ProductionVersion/${id}`, dto, this.httpOptions).pipe(
    tap({
      next: () => console.log('After send update production version success'),
      error: (err) => console.error('Update production version failed:', err)
    }),
    catchError(this.handleError)
  );
}

deleteProductionVersion(id: number): Observable<void> {
  console.log('Deleting production version ID:', id);
  return this.http.delete<void>(`${this.mescoFiApiUrl}/ProductionVersion/${id}`).pipe(
    tap({
      next: () => console.log('Delete production version successful'),
      error: (err) => console.error('Delete production version failed:', err)
    }),
    catchError(this.handleError)
  );
}

addBOMToProductionVersion(productionVersionId: number, bomId: number): Observable<any> {
  console.log('Adding BOM ID:', bomId, 'to production version ID:', productionVersionId);
  return this.http.post<any>(`${this.mescoFiApiUrl}/ProductionVersion/${productionVersionId}/addbom/${bomId}`, {}, this.httpOptions).pipe(
    tap({
      next: (response) => console.log('Add BOM successful:', response),
      error: (err) => console.error('Add BOM failed:', err)
    }),
    catchError(this.handleError)
  );
}

removeBOMFromProductionVersion(productionVersionId: number): Observable<any> {
  console.log('Removing BOM from production version ID:', productionVersionId);
  return this.http.delete<any>(`${this.mescoFiApiUrl}/ProductionVersion/${productionVersionId}/removebom`).pipe(
    tap({
      next: (response) => console.log('Remove BOM successful:', response),
      error: (err) => console.error('Remove BOM failed:', err)
    }),
    catchError(this.handleError)
  );
}

addRoutingToProductionVersion(productionVersionId: number, routingId: number): Observable<any> {
  console.log('Adding Routing ID:', routingId, 'to production version ID:', productionVersionId);
  return this.http.post<any>(`${this.mescoFiApiUrl}/ProductionVersion/${productionVersionId}/addrouting/${routingId}`, {}, this.httpOptions).pipe(
    tap({
      next: (response) => console.log('Add Routing successful:', response),
      error: (err) => console.error('Add Routing failed:', err)
    }),
    catchError(this.handleError)
  );
}

removeRoutingFromProductionVersion(productionVersionId: number): Observable<any> {
  console.log('Removing Routing from production version ID:', productionVersionId);
  return this.http.delete<any>(`${this.mescoFiApiUrl}/ProductionVersion/${productionVersionId}/removerouting`).pipe(
    tap({
      next: (response) => console.log('Remove Routing successful:', response),
      error: (err) => console.error('Remove Routing failed:', err)
    }),
    catchError(this.handleError)
  );
}
getAllProductOrders(): Observable<ProductOrderDto[]> {
  console.log('Fetching all product orders');
  return this.http.get<ProductOrderDto[]>(`${this.mescoFiApiUrl}/ProductOrders`).pipe(
    tap({ next: data => console.log('Fetched:', data), error: err => console.error('Failed:', err) }),
    catchError(this.handleError)
  );
}

getProductOrderById(id: number): Observable<ProductOrderDto> {
  console.log('Fetching ID:', id);
  return this.http.get<ProductOrderDto>(`${this.mescoFiApiUrl}/ProductOrders/${id}`).pipe(
    tap({ next: data => console.log('Fetched:', data), error: err => console.error('Failed:', err) }),
    catchError(this.handleError)
  );
}

createProductOrder(dto: CreateProductOrderDto): Observable<ProductOrderDto> {
  console.log('Creating:', JSON.stringify(dto));
  return this.http.post<ProductOrderDto>(`${this.mescoFiApiUrl}/ProductOrders`, dto, this.httpOptions).pipe(
    tap({ next: res => console.log('Created:', res), error: err => console.error('Failed:', err) }),
    catchError(this.handleError)
  );
}

sendProductOrder(id: number): Observable<any> {
  console.log('Sending ID:', id);
  return this.http.post<any>(`${this.mescoFiApiUrl}/ProductOrders/send/${id}`, {}, this.httpOptions).pipe(
    tap({ next: res => console.log('Sent:', res), error: err => console.error('Failed:', err) }),
    catchError(this.handleError)
  );
}

requestProductOrder(id: number): Observable<any> {
  console.log('Requesting ID:', id);
  return this.http.post<any>(`${this.mescoFiApiUrl}/ProductOrders/request/${id}`, {}, this.httpOptions).pipe(
    tap({ next: res => console.log('Requested:', res), error: err => console.error('Failed:', err) }),
    catchError(this.handleError)
  );
}

deleteProductOrder(id: number): Observable<void> {
  console.log('Deleting ID:', id);
  return this.http.delete<void>(`${this.mescoFiApiUrl}/ProductOrders/${id}`).pipe(
    tap({ next: () => console.log('Deleted'), error: err => console.error('Failed:', err) }),
    catchError(this.handleError)
  );
}
}