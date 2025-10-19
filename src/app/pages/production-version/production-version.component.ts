// src/app/pages/production-version/production-version.component.ts
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service';
import { ProductionVersionDto, CreateProductionVersionDto } from '../../models/production-version.model';
import { BOMDto } from '../../models/bom.model';
import { RoutingDto } from '../../models/routing.model';
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
  selector: 'app-production-version',
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
  templateUrl: './production-version.component.html',
  styleUrls: ['./production-version.component.css'],
  providers: [MessageService, ConfirmationService]
})
export class ProductionVersionComponent {
  productionVersions = signal<ProductionVersionDto[]>([]);
  selectedProductionVersion = signal<ProductionVersionDto | null>(null);
  productionVersionForm: FormGroup;
  displayFormDialog = signal<boolean>(false);
  displayBOMDialog = signal<boolean>(false);
  displayRoutingDialog = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  isAddMode = signal<boolean>(true); // For add/remove mode
  selectedBOMId = signal<number>(0);
  selectedRoutingId = signal<number>(0);

  allBOMs = signal<BOMDto[]>([]);
  allRoutings = signal<RoutingDto[]>([]);
  bomsForAdd = signal<Option[]>([]);
  routingsForAdd = signal<Option[]>([]);

  private apiService = inject(ApiService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);

  constructor() {
    this.productionVersionForm = this.fb.group({
      versionCode: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadProductionVersions();
    this.loadBOMs();
    this.loadRoutings();
  }

  loadProductionVersions(): void {
    this.apiService.getAllProductionVersions().subscribe({
      next: (data: ProductionVersionDto[]) => this.productionVersions.set(data),
      error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load production versions: ' + err.message })
    });
  }

  loadBOMs(): void {
    this.apiService.getAllBOMs().subscribe({
      next: (data: BOMDto[]) => this.allBOMs.set(data),
      error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load BOMs: ' + err.message })
    });
  }

  loadRoutings(): void {
    this.apiService.getAllRoutings().subscribe({
      next: (data: RoutingDto[]) => this.allRoutings.set(data),
      error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load routings: ' + err.message })
    });
  }

  openCreateDialog(): void {
    this.isEditMode.set(false);
    this.productionVersionForm.reset();
    this.displayFormDialog.set(true);
  }

  openEditDialog(productionVersion: ProductionVersionDto): void {
    this.selectedProductionVersion.set(productionVersion);
    this.isEditMode.set(true);
    this.productionVersionForm.patchValue({
      versionCode: productionVersion.versionCode,
      description: productionVersion.description
    });
    this.displayFormDialog.set(true);
  }

  saveProductionVersion(): void {
    if (this.productionVersionForm.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please fill all required fields' });
      return;
    }

    const formValue: CreateProductionVersionDto = this.productionVersionForm.value;

    if (this.isEditMode()) {
      this.apiService.updateProductionVersion(this.selectedProductionVersion()!.id, formValue).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Production version updated' });
          this.loadProductionVersions();
          this.displayFormDialog.set(false);
        },
        error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update: ' + (err.error?.message || err.message) })
      });
    } else {
      this.apiService.createProductionVersion(formValue).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Production version created' });
          this.loadProductionVersions();
          this.displayFormDialog.set(false);
        },
        error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create: ' + (err.error?.message || err.message) })
      });
    }
  }

  deleteProductionVersion(productionVersion: ProductionVersionDto): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this production version?',
      accept: () => {
        this.apiService.deleteProductionVersion(productionVersion.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Production version deleted' });
            this.loadProductionVersions();
          },
          error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete: ' + (err.error?.message || err.message) })
        });
      }
    });
  }

  openBOMDialog(productionVersion: ProductionVersionDto, isAdd: boolean): void {
    this.selectedProductionVersion.set(productionVersion);
    this.isAddMode.set(isAdd);
    this.selectedBOMId.set(0);

    if (isAdd) {
      if (productionVersion.bom) {
        this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'BOM already assigned. Remove first to add new.' });
        return;
      }
      const available = this.allBOMs().map(bom => ({ label: `${bom.bomDescription} (ID: ${bom.id})`, value: bom.id }));
      this.bomsForAdd.set(available);
    } // For remove, no list needed - just confirm in dialog

    this.displayBOMDialog.set(true);
  }

  manageBOM(): void {
    if (!this.selectedProductionVersion()) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Invalid selection' });
      return;
    }

    const pvId = this.selectedProductionVersion()!.id;

    if (this.isAddMode()) {
      if (!this.selectedBOMId()) {
        this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please select a BOM' });
        return;
      }
      this.apiService.addBOMToProductionVersion(pvId, this.selectedBOMId()).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'BOM added' });
          this.loadProductionVersions();
          this.displayBOMDialog.set(false);
        },
        error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to add: ' + (err.error?.message || err.message) })
      });
    } else {
      this.apiService.removeBOMFromProductionVersion(pvId).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'BOM removed' });
          this.loadProductionVersions();
          this.displayBOMDialog.set(false);
        },
        error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to remove: ' + (err.error?.message || err.message) })
      });
    }
  }

  openRoutingDialog(productionVersion: ProductionVersionDto, isAdd: boolean): void {
    this.selectedProductionVersion.set(productionVersion);
    this.isAddMode.set(isAdd);
    this.selectedRoutingId.set(0);

    if (isAdd) {
      if (productionVersion.routing) {
        this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Routing already assigned. Remove first to add new.' });
        return;
      }
      const available = this.allRoutings().map(routing => ({ label: `${routing.description} (ID: ${routing.id})`, value: routing.id }));
      this.routingsForAdd.set(available);
    } // For remove, no list

    this.displayRoutingDialog.set(true);
  }

  manageRouting(): void {
    if (!this.selectedProductionVersion()) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Invalid selection' });
      return;
    }

    const pvId = this.selectedProductionVersion()!.id;

    if (this.isAddMode()) {
      if (!this.selectedRoutingId()) {
        this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please select a Routing' });
        return;
      }
      this.apiService.addRoutingToProductionVersion(pvId, this.selectedRoutingId()).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Routing added' });
          this.loadProductionVersions();
          this.displayRoutingDialog.set(false);
        },
        error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to add: ' + (err.error?.message || err.message) })
      });
    } else {
      this.apiService.removeRoutingFromProductionVersion(pvId).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Routing removed' });
          this.loadProductionVersions();
          this.displayRoutingDialog.set(false);
        },
        error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to remove: ' + (err.error?.message || err.message) })
      });
    }
  }

  getBOMLabel(bom?: BOMDto): string {
    return bom ? `${bom.bomDescription} (ID: ${bom.id})` : 'None';
  }

  getRoutingLabel(routing?: RoutingDto): string {
    return routing ? `${routing.description} (ID: ${routing.id})` : 'None';
  }
}