// src/app/pages/bom/bom.component.ts
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service';
import { BOMDto, CreateBOMDto, BOMStatus } from '../../models/bom.model';
import { MaterialDto } from '../../models/material.model'; // Adjust if needed
import { ConfirmationService, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';

interface Option {
  label: string;
  value: number;
}

@Component({
  selector: 'app-bom',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    TableModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule
  ],
  templateUrl: './bom.component.html',
  styleUrls: ['./bom.component.css'],
  providers: [MessageService, ConfirmationService]
})
export class BomComponent {
  boms = signal<BOMDto[]>([]);
  selectedBom = signal<BOMDto | null>(null);
  bomForm: FormGroup;
  displayFormDialog = signal<boolean>(false);
  displayMaterialDialog = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  isAddMode = signal<boolean>(true);
  selectedMaterialId = signal<number>(0);

  allMaterials = signal<MaterialDto[]>([]);
  materialsForAdd = signal<Option[]>([]);
  materialsForRemove = signal<Option[]>([]);

  bomStatusOptions = [
    { label: 'Active', value: BOMStatus.ACTIVE },
    { label: 'Inactive', value: BOMStatus.INACTIVE },
    { label: 'Under Revision', value: BOMStatus.UNDER_REVISION },
    { label: 'Locked', value: BOMStatus.LOCKED },
    { label: 'Deleted', value: BOMStatus.DELETED }
  ];

  private apiService = inject(ApiService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);

  constructor() {
    this.bomForm = this.fb.group({
      bomNumber: ['', Validators.required],
      alternativeBomNumber: [''],
      bomStatus: [BOMStatus.ACTIVE, Validators.required],
      validityStartDate: [new Date().toISOString().split('T')[0], Validators.required],
      validityEndDate: [new Date().toISOString().split('T')[0], Validators.required],
      baseQuantity: ['', Validators.required],
      unitOfMeasure: ['', Validators.required],
      bomDescription: ['', Validators.required],
      principalMaterialId: [0, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadBOMs();
    this.loadMaterials();
  }

  loadBOMs(): void {
    this.apiService.getAllBOMs().subscribe({
      next: (data: BOMDto[]) => this.boms.set(data),
      error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load BOMs: ' + err.message })
    });
  }

  loadMaterials(): void {
    this.apiService.getAllMaterials().subscribe({
      next: (data: MaterialDto[]) => this.allMaterials.set(data),
      error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load materials: ' + err.message })
    });
  }

  openCreateDialog(): void {
    this.isEditMode.set(false);
    this.bomForm.reset({ 
      bomStatus: BOMStatus.ACTIVE, 
      validityStartDate: new Date().toISOString().split('T')[0],
      validityEndDate: new Date().toISOString().split('T')[0],
      principalMaterialId: 0 
    });
    this.displayFormDialog.set(true);
  }

  openEditDialog(bom: BOMDto): void {
    this.selectedBom.set(bom);
    this.isEditMode.set(true);
    this.bomForm.patchValue({
      bomNumber: bom.bomNumber,
      alternativeBomNumber: bom.alternativeBomNumber,
      bomStatus: bom.bomStatus,
      validityStartDate: new Date(bom.validityStartDate).toISOString().split('T')[0],
      validityEndDate: new Date(bom.validityEndDate).toISOString().split('T')[0],
      baseQuantity: bom.baseQuantity,
      unitOfMeasure: bom.unitOfMeasure,
      bomDescription: bom.bomDescription,
      principalMaterialId: bom.principalMaterial?.id || 0
    });
    this.displayFormDialog.set(true);
  }

  saveBOM(): void {
    if (this.bomForm.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please fill all required fields' });
      return;
    }

    const formValue: CreateBOMDto = this.bomForm.value;

    if (this.isEditMode()) {
      const dto: CreateBOMDto = formValue;
      this.apiService.updateBOM(this.selectedBom()!.id, dto).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'BOM updated' });
          this.loadBOMs();
          this.displayFormDialog.set(false);
        },
        error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update: ' + (err.error?.message || err.message) })
      });
    } else {
      const dto: CreateBOMDto = formValue;
      this.apiService.createBOM(dto).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'BOM created' });
          this.loadBOMs();
          this.displayFormDialog.set(false);
        },
        error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create: ' + (err.error?.message || err.message) })
      });
    }
  }

  deleteBOM(bom: BOMDto): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this BOM?',
      accept: () => {
        this.apiService.deleteBOM(bom.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'BOM deleted' });
            this.loadBOMs();
          },
          error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete: ' + (err.error?.message || err.message) })
        });
      }
    });
  }

  openMaterialDialog(bom: BOMDto, isAdd: boolean): void {
    this.selectedBom.set(bom);
    this.isAddMode.set(isAdd);
    this.selectedMaterialId.set(0);

    if (!bom.materials) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'No materials found' });
      return;
    }

    const assignedIds = new Set(bom.materials?.map(m => m.id) || []);

    if (isAdd) {
      const available = this.allMaterials()
        .filter(m => m.id !== undefined && !assignedIds.has(m.id))
        .map(m => ({ label: `${m.description} (ID: ${m.id})`, value: m.id! }));
      this.materialsForAdd.set(available);
    } else {
      const assigned = bom.materials?.filter(m => m.id !== undefined).map(m => ({ label: `${m.description} (ID: ${m.id})`, value: m.id! })) || [];
      this.materialsForRemove.set(assigned);
    }

    this.displayMaterialDialog.set(true);
  }

  manageMaterial(): void {
    if (!this.selectedBom() || !this.selectedMaterialId()) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please select a material' });
      return;
    }

    const materialId = this.selectedMaterialId();
    const bomId = this.selectedBom()!.id;

    if (this.isAddMode()) {
      this.apiService.addMaterialToBOM(bomId, materialId).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Material added' });
          this.loadBOMs();
          this.displayMaterialDialog.set(false);
        },
        error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to add: ' + (err.error?.message || err.message) })
      });
    } else {
      this.apiService.removeMaterialFromBOM(bomId, materialId).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Material removed' });
          this.loadBOMs();
          this.displayMaterialDialog.set(false);
        },
        error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to remove: ' + (err.error?.message || err.message) })
      });
    }
  }

  getMaterialLabel(materialId: number): string {
    return this.allMaterials().find(m => m.id === materialId)?.description || 'Unknown';
  }

  getBOMStatusLabel(status: BOMStatus): string {
    return this.bomStatusOptions.find(opt => opt.value === status)?.label || 'Unknown';
  }
}