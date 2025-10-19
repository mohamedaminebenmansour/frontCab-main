// src/app/pages/control-model/control-model.component.ts
// Changes:
// - No major logic changes needed since the assignment/removal from control model side was already present.
// - Updated console logs for clarity.
// - Ensured loadMaterials uses full MaterialDto as before.
// - No new features added here, as symmetry is handled in material.component.ts.
// - Minor: Fixed truncation issues and ensured non-null assertions are safe.

import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service';
import { ControlModelDto, CreateControlModelDto, UpdateControlModelDto, ControlModelType, CreateControlModelWithMaterialsDto } from '../../models/control-model.model';
import { CharacteristicDto } from '../../models/characteristic.model'; // Adjust if needed
import { MaterialDto } from '../../models/material.model'; // Changed from MaterialSlimDto to MaterialDto to match API response
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
  selector: 'app-control-model',
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
  templateUrl: './control-model.component.html',
  styleUrls: ['./control-model.component.css'],
  providers: [MessageService, ConfirmationService]
})
export class ControlModelComponent {
  controlModels = signal<ControlModelDto[]>([]);
  selectedControlModel = signal<ControlModelDto | null>(null);
  controlModelForm: FormGroup;
  displayFormDialog = signal<boolean>(false);
  displayCharDialog = signal<boolean>(false);
  displayMaterialDialog = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  isAssignMode = signal<boolean>(true); // For char and material

  // For characteristics and materials management
  allCharacteristics = signal<CharacteristicDto[]>([]);
  characteristicsForAssign = signal<Option[]>([]);
  characteristicsForRemove = signal<Option[]>([]);
  selectedCharId = signal<number>(0);

  allMaterials = signal<MaterialDto[]>([]); // Changed to MaterialDto[] to match API response (getMaterials returns full DTOs)
  materialsForAssign = signal<Option[]>([]);
  materialsForRemove = signal<Option[]>([]);
  selectedMaterialId = signal<number>(0);

  modelTypeOptions = [
    { label: 'PAC', value: ControlModelType.PAC },
    { label: 'TPV', value: ControlModelType.TPV }
  ];

  private apiService = inject(ApiService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);

  constructor() {
    this.controlModelForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      modelType: [ControlModelType.PAC, Validators.required],
      isPrincipal: [false]
      // Add more if needed, e.g., materials for create with materials
    });
  }

  ngOnInit(): void {
    console.log('Component initialized. Loading control models, characteristics, and materials...');
    this.loadControlModels();
    this.loadCharacteristics();
    this.loadMaterials(); // Assume you add this method to api.service.ts
  }

  loadControlModels(): void {
    console.log('Loading all control models from API...');
    this.apiService.getControlModels().subscribe({
      next: (data) => {
        console.log('Control models loaded successfully:', data);
        this.controlModels.set(data);
      },
      error: (err) => {
        console.error('Error loading control models:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load control models' });
      }
    });
  }

  loadCharacteristics(): void {
    console.log('Loading all characteristics from API...');
    this.apiService.getCharacteristics().subscribe({
      next: (data) => {
        console.log('Characteristics loaded successfully:', data);
        this.allCharacteristics.set(data);
      },
      error: (err) => {
        console.error('Error loading characteristics:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load characteristics' });
      }
    });
  }

  loadMaterials(): void {
    console.log('Loading all materials from API...');
    this.apiService.getMaterials().subscribe({ // Add this method to service if not there: similar to getCharacteristics
      next: (data) => {
        console.log('Materials loaded successfully:', data);
        this.allMaterials.set(data); // Now assigns MaterialDto[] correctly
      },
      error: (err) => {
        console.error('Error loading materials:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load materials' });
      }
    });
  }

  openCreateDialog(): void {
    console.log('Opening create control model dialog...');
    this.isEditMode.set(false);
    this.selectedControlModel.set(null);
    this.controlModelForm.reset({
      modelType: ControlModelType.PAC,
      isPrincipal: false
    });
    this.displayFormDialog.set(true);
  }

  openEditDialog(model: ControlModelDto): void {
    console.log('Opening edit dialog for control model:', model.id);
    this.isEditMode.set(true);
    this.selectedControlModel.set(model);
    this.controlModelForm.patchValue(model);
    this.displayFormDialog.set(true);
  }

  saveControlModel(): void {
    if (this.controlModelForm.invalid) {
      console.warn('Form invalid. Cannot save control model.');
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please fill all required fields' });
      this.controlModelForm.markAllAsTouched();
      return;
    }

    const dto = this.controlModelForm.value as CreateControlModelDto; // or UpdateControlModelDto

    if (this.isEditMode() && this.selectedControlModel()) {
      this.apiService.updateControlModel(this.selectedControlModel()!.id, dto as UpdateControlModelDto).subscribe({
        next: () => {
          console.log('Control model updated successfully.');
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Control model updated' });
          this.loadControlModels();
          this.displayFormDialog.set(false);
        },
        error: (err) => {
          console.error('Error updating control model:', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update' });
        }
      });
    } else {
      this.apiService.createControlModel(dto).subscribe({
        next: () => {
          console.log('Control model created successfully.');
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Control model created' });
          this.loadControlModels();
          this.displayFormDialog.set(false);
        },
        error: (err) => {
          console.error('Error creating control model:', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create' });
        }
      });
    }
  }

  deleteControlModel(model: ControlModelDto): void {
    console.log('Deleting control model ID:', model.id);
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this control model?',
      accept: () => {
        this.apiService.deleteControlModel(model.id).subscribe({
          next: () => {
            console.log('Control model deleted successfully.');
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Control model deleted' });
            this.loadControlModels();
          },
          error: (err) => {
            console.error('Error deleting control model:', err);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete' });
          }
        });
      }
    });
  }

  openCharDialog(model: ControlModelDto, isAssign: boolean): void {
    console.log(`Opening characteristic dialog for control model ID: ${model.id}. Mode: ${isAssign ? 'Assign' : 'Remove'}`);
    this.selectedControlModel.set(model);
    this.isAssignMode.set(isAssign);
    this.selectedCharId.set(0);

    if (isAssign) {
      const assignedIds = new Set(model.characteristics.map(c => c.id));
      const available = this.allCharacteristics()
        .filter(c => !assignedIds.has(c.id))
        .map(c => ({
          label: `${c.characteristicNumber} - ${c.characteristicName || 'No Name'}`,
          value: c.id!
        }));
      this.characteristicsForAssign.set(available);
      console.log('Available characteristics for assign:', available);
    } else {
      const assigned = model.characteristics.map(c => ({
        label: `${c.characteristicNumber} - ${c.characteristicName || 'No Name'}`,
        value: c.id!
      }));
      this.characteristicsForRemove.set(assigned);
      console.log('Assigned characteristics for remove:', assigned);
    }

    this.displayCharDialog.set(true);
  }

  manageCharacteristic(): void {
    if (!this.selectedControlModel() || !this.selectedCharId()) {
      console.warn('No characteristic selected. Cannot proceed.');
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please select a characteristic' });
      return;
    }

    const charId = this.selectedCharId();
    console.log(`Managing characteristic ID: ${charId} for control model ID: ${this.selectedControlModel()!.id}. Mode: ${this.isAssignMode() ? 'Assign' : 'Remove'}`);

    if (this.isAssignMode()) {
      this.apiService.addCharacteristicToControlModel(this.selectedControlModel()!.id, charId).subscribe({
        next: () => {
          console.log(`Characteristic ${charId} assigned successfully.`);
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Characteristic assigned' });
          this.loadControlModels();
          this.displayCharDialog.set(false);
        },
        error: (err) => {
          console.error(`Error assigning characteristic ${charId}:`, err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to assign: ' + (err.error?.error || err.message) });
        }
      });
    } else {
      this.apiService.removeCharacteristicFromControlModel(this.selectedControlModel()!.id, charId).subscribe({
        next: () => {
          console.log(`Characteristic ${charId} removed successfully.`);
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Characteristic removed' });
          this.loadControlModels();
          this.displayCharDialog.set(false);
        },
        error: (err) => {
          console.error(`Error removing characteristic ${charId}:`, err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to remove' });
        }
      });
    }
  }

  openMaterialDialog(model: ControlModelDto, isAssign: boolean): void {
    console.log(`Opening material dialog for control model ID: ${model.id}. Mode: ${isAssign ? 'Assign' : 'Remove'}`);
    this.selectedControlModel.set(model);
    this.isAssignMode.set(isAssign);
    this.selectedMaterialId.set(0);

    if (isAssign) {
      const assignedIds = new Set(model.materials.map(m => m.id));
      console.log('Assigned material IDs:', Array.from(assignedIds));
      const available = this.allMaterials()
        .filter(m => !assignedIds.has(m.id))
        .map(m => ({
          label: `ID: ${m.id} - Description: ${m.description || 'No Description'}`, // Changed from 'name' to 'description' to match DTO
          value: m.id!
        }));
      this.materialsForAssign.set(available);
      console.log('Available materials for assign:', available);
    } else {
      const assigned = model.materials.map(m => ({
        label: `ID: ${m.id} - Description: ${m.description || 'No Description'}`, // Changed from 'name' to 'description'
        value: m.id!
      }));
      this.materialsForRemove.set(assigned);
      console.log('Assigned materials for remove:', assigned);
    }

    this.displayMaterialDialog.set(true);
  }

  manageMaterial(): void {
    if (!this.selectedControlModel() || !this.selectedMaterialId()) {
      console.warn('No material selected. Cannot proceed.');
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please select a material' });
      return;
    }

    const materialId = this.selectedMaterialId();
    console.log(`Managing material ID: ${materialId} for control model ID: ${this.selectedControlModel()!.id}. Mode: ${this.isAssignMode() ? 'Assign' : 'Remove'}`);

    if (this.isAssignMode()) {
      this.apiService.addMaterialToControlModel(this.selectedControlModel()!.id, materialId).subscribe({
        next: () => {
          console.log(`Material ${materialId} assigned successfully.`);
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Material assigned' });
          this.loadControlModels();
          this.displayMaterialDialog.set(false);
        },
        error: (err) => {
          console.error(`Error assigning material ${materialId}:`, err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to assign' });
        }
      });
    } else {
      this.apiService.removeMaterialFromControlModel(this.selectedControlModel()!.id, materialId).subscribe({
        next: () => {
          console.log(`Material ${materialId} removed successfully.`);
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Material removed' });
          this.loadControlModels();
          this.displayMaterialDialog.set(false);
        },
        error: (err) => {
          console.error(`Error removing material ${materialId}:`, err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to remove' });
        }
      });
    }
  }

  // Optional: Create with materials - you can add a separate dialog/form if needed
  createWithMaterials(): void {
    // Example: Collect materialIds from a multi-select, etc.
    const dto: CreateControlModelWithMaterialsDto = {
      description: 'New Model',
      materialIds: [1, 2] // Example; use form
    };
    this.apiService.createControlModelWithMaterials(dto).subscribe({
      next: () => console.log('Created with materials'),
      error: (err) => console.error('Error:', err)
    });
  }

  getTypeLabel(type: ControlModelType): string {
    return this.modelTypeOptions.find(opt => opt.value === type)?.label || 'Unknown';
  }
}