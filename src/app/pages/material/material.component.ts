// src/app/pages/material/material.component.ts
// Changes:
// - Fixed assign/remove: Updated manageControlModel error message to include err.error?.message || err.message.
// - For set principal, filter options to only assigned control models in openPrincipalDialog: use material.controlModels instead of allControlModels.
// - If no assigned, perhaps show message, but for now, filter to assigned.
// - In HTML details, added Principal Control Model display.
// - Assumed removeControlModelFromMaterial endpoint is remove-control-model, but if different, adjust.
// - For set principal not working, perhaps was parsing error, now fixed in backend.

import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service';
import { MaterialDto, CreateMaterialDto, MaterialType } from '../../models/material.model';
import { ClassificationDto } from '../../models/classification.model'; // For classify
import { ControlModelDto } from '../../models/control-model.model'; // For principal
import { ConfirmationService, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';

interface Option {
  label: string;
  value: number | string;
}

@Component({
  selector: 'app-material',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    TableModule,
    DialogModule,
    CheckboxModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule
  ],
  templateUrl: './material.component.html',
  styleUrls: ['./material.component.css'],
  providers: [MessageService, ConfirmationService]
})
export class MaterialComponent {
  materials = signal<MaterialDto[]>([]);
  selectedMaterial = signal<MaterialDto | null>(null);
  materialForm: FormGroup;
  displayFormDialog = signal<boolean>(false);
  displayClassifyDialog = signal<boolean>(false);
  displayPrincipalDialog = signal<boolean>(false);
  displayControlModelDialog = signal<boolean>(false); // New for assign/remove control model
  isEditMode = signal<boolean>(false);
  isAssignMode = signal<boolean>(true); // New for control model assign/remove mode

  // For classify and principal
  allClassifications = signal<ClassificationDto[]>([]);
  selectedClassificationId = signal<number>(0);

  allControlModels = signal<ControlModelDto[]>([]);
  selectedControlModelId = signal<number>(0);

  // New for control model management
  controlModelsForAssign = signal<Option[]>([]);
  controlModelsForRemove = signal<Option[]>([]);

  // For principal options, now signal for filtered
  principalOptions = signal<Option[]>([]);

  materialTypeOptions = [
    { label: 'ROH (Raw Material)', value: MaterialType.ROH },
    { label: 'HALB (Semi-Finished)', value: MaterialType.HALB },
    { label: 'FERT (Finished Product)', value: MaterialType.FERT }
  ];

  private apiService = inject(ApiService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);

  constructor() {
    this.materialForm = this.fb.group({
      materialNumber: ['', Validators.required],
      materialType: [MaterialType.ROH, Validators.required],
      description: ['', Validators.required],
      baseUnitOfMeasure: ['', Validators.required],
      materialGroup: [''],
      division: [''],
      batchManagement: [false],
      serialNumberManagement: [false],
      taxClassification: [''],
      industrySector: [''],
      oldMaterialNumber: [''],
      materialHierarchy: [''],
      materialStatus: [''],
      procurementType: [''],
      mrpType: [''],
      mrpController: [''],
      lotSize: [''],
      purchasingGroup: [''],
      purchasingValueKey: [''],
      accountAssignmentGroup: [''],
      valuationClass: [''],
      standardPrice: [0, Validators.min(0)],
      movingAveragePrice: [0, Validators.min(0)],
      taxData: [''],
      classificationData: ['']
    });
  }

  ngOnInit(): void {
    this.loadMaterials();
    this.loadClassifications();
    this.loadControlModels();
  }

  loadMaterials(): void {
    this.apiService.getMaterials().subscribe({
      next: (data) => {
        this.materials.set(data);
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load materials' });
      }
    });
  }

  loadClassifications(): void {
    this.apiService.getClassifications().subscribe({
      next: (data) => {
        this.allClassifications.set(data);
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load classifications' });
      }
    });
  }

  loadControlModels(): void {
    this.apiService.getControlModels().subscribe({
      next: (data) => {
        this.allControlModels.set(data);
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load control models' });
      }
    });
  }

  openCreateDialog(): void {
    this.isEditMode.set(false);
    this.selectedMaterial.set(null);
    this.materialForm.reset({
      materialType: MaterialType.ROH,
      batchManagement: false,
      serialNumberManagement: false,
      standardPrice: 0,
      movingAveragePrice: 0
    });
    this.displayFormDialog.set(true);
  }

  openEditDialog(material: MaterialDto): void {
    this.isEditMode.set(true);
    this.selectedMaterial.set(material);
    this.materialForm.patchValue(material);
    this.displayFormDialog.set(true);
  }

  saveMaterial(): void {
    if (this.materialForm.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please fill all required fields' });
      this.materialForm.markAllAsTouched();
      return;
    }

    const formValue = this.materialForm.value;
  
    const dto: CreateMaterialDto = {
      ...formValue,
      materialType: Number(formValue.materialType)
    };

    console.log('DEBUG: Before creating/updating material - DTO:', dto);

    if (this.isEditMode() && this.selectedMaterial()) {
      this.apiService.updateMaterial(this.selectedMaterial()!.id, dto).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Material updated' });
          this.loadMaterials();
          this.displayFormDialog.set(false);
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update' });
        }
      });
    } else {
      this.apiService.createMaterial(dto).subscribe({
        next: (response) => {
          console.log('DEBUG: After creating new material - Success response:', response);
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Material created' });
          this.loadMaterials();
          this.displayFormDialog.set(false);
        },
        error: (err) => {
          console.log('DEBUG: After creating new material - Error:', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create' });
        }
      });
    }
  }

  deleteMaterial(material: MaterialDto): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this material?',
      accept: () => {
        this.apiService.deleteMaterial(material.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Material deleted' });
            this.loadMaterials();
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete' });
          }
        });
      }
    });
  }

  openClassifyDialog(material: MaterialDto): void {
    this.selectedMaterial.set(material);
    this.selectedClassificationId.set(0);
    this.displayClassifyDialog.set(true);
  }

  classifyMaterial(): void {
    if (!this.selectedMaterial() || !this.selectedClassificationId()) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please select a classification' });
      return;
    }

    const classId = this.selectedClassificationId();
    this.apiService.classifyMaterial(this.selectedMaterial()!.id, classId).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Material classified' });
        this.loadMaterials();
        this.displayClassifyDialog.set(false);
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to classify' });
      }
    });
  }

  openPrincipalDialog(material: MaterialDto): void {
    this.selectedMaterial.set(material);
    this.selectedControlModelId.set(0);
    // Filter to only assigned control models
    const assigned = material.controlModels.map(cm => ({
      label: `ID: ${cm.id} - Description: ${cm.description || 'No Description'}`,
      value: cm.id!
    }));
    this.principalOptions.set(assigned);
    if (assigned.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'No control models assigned to this material' });
      return;
    }
    this.displayPrincipalDialog.set(true);
  }

  setPrincipal(): void {
    if (!this.selectedMaterial() || !this.selectedControlModelId()) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please select a control model' });
      return;
    }

    const cmId = this.selectedControlModelId();
    this.apiService.setPrincipalControlModel(this.selectedMaterial()!.id, cmId).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Principal control model set' });
        this.loadMaterials();
        this.displayPrincipalDialog.set(false);
      },
      error: (err) => {
        console.error('Error setting principal:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to set principal: ' + (err.error?.message || err.message) });
      }
    });
  }

  openControlModelDialog(material: MaterialDto, isAssign: boolean): void {
    console.log(`Opening control model dialog for material ID: ${material.id}. Mode: ${isAssign ? 'Assign' : 'Remove'}`);
    this.selectedMaterial.set(material);
    this.isAssignMode.set(isAssign);
    this.selectedControlModelId.set(0);

    if (isAssign) {
      const assignedIds = new Set(material.controlModels.map(cm => cm.id));
      const available = this.allControlModels()
        .filter(cm => !assignedIds.has(cm.id))
        .map(cm => ({
          label: `ID: ${cm.id} - Description: ${cm.description || 'No Description'}`,
          value: cm.id!
        }));
      this.controlModelsForAssign.set(available);
      console.log('Available control models for assign:', available);
    } else {
      const assigned = material.controlModels.map(cm => ({
        label: `ID: ${cm.id} - Description: ${cm.description || 'No Description'}`,
        value: cm.id!
      }));
      this.controlModelsForRemove.set(assigned);
      console.log('Assigned control models for remove:', assigned);
    }

    this.displayControlModelDialog.set(true);
  }

  manageControlModel(): void {
    if (!this.selectedMaterial() || !this.selectedControlModelId()) {
      console.warn('No control model selected. Cannot proceed.');
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please select a control model' });
      return;
    }

    const controlModelId = this.selectedControlModelId();
    console.log(`Managing control model ID: ${controlModelId} for material ID: ${this.selectedMaterial()!.id}. Mode: ${this.isAssignMode() ? 'Assign' : 'Remove'}`);

    if (this.isAssignMode()) {
      this.apiService.assignControlModelToMaterial(this.selectedMaterial()!.id, controlModelId).subscribe({
        next: () => {
          console.log(`Control model ${controlModelId} assigned successfully.`);
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Control model assigned' });
          this.loadMaterials();
          this.displayControlModelDialog.set(false);
        },
        error: (err) => {
          console.error(`Error assigning control model ${controlModelId}:`, err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to assign: ' + (err.error?.message || err.message) });
        }
      });
    } else {
      this.apiService.removeControlModelFromMaterial(this.selectedMaterial()!.id, controlModelId).subscribe({
        next: () => {
          console.log(`Control model ${controlModelId} removed successfully.`);
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Control model removed' });
          this.loadMaterials();
          this.displayControlModelDialog.set(false);
        },
        error: (err) => {
          console.error(`Error removing control model ${controlModelId}:`, err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to remove: ' + (err.error?.message || err.message) });
        }
      });
    }
  }

  getTypeLabel(type: MaterialType): string {
    console.log('DEBUG: getTypeLabel - Input type:', type);
    const result = this.materialTypeOptions.find(opt => opt.value === type)?.label || 'Unknown';
    console.log('DEBUG: getTypeLabel - Result:', result);
    return result;
  }

  getPrincipalLabel(material: MaterialDto): string {
    return material.principalControlModel ? material.principalControlModel.description : 'None';
  }
}