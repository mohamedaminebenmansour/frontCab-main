// src/app/pages/product-orders/product-orders.component.ts
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service';
import { ProductOrderDto, CreateProductOrderDto } from '../../models/product-order.model';
import { MaterialDto } from '../../models/material.model';
import { ProductionVersionDto } from '../../models/production-version.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-product-orders',
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
  templateUrl: './product-orders.component.html',
  styleUrls: ['./product-orders.component.css'],
  providers: [MessageService, ConfirmationService]
})
export class ProductOrdersComponent {
  productOrders = signal<ProductOrderDto[]>([]);
  selectedProductOrder = signal<ProductOrderDto | null>(null);
  productOrderForm: FormGroup;
  displayFormDialog = signal<boolean>(false);

  allMaterials = signal<MaterialDto[]>([]);
  allProductionVersions = signal<ProductionVersionDto[]>([]);

  private apiService = inject(ApiService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);

  constructor() {
    this.productOrderForm = this.fb.group({
      orderNumber: ['', Validators.required],
      orderDescription: ['', Validators.required],
      orderDate: [new Date().toISOString().split('T')[0], Validators.required],
      startDate: [new Date().toISOString().split('T')[0], Validators.required],
      endDate: [new Date().toISOString().split('T')[0], Validators.required],
      plannedQuantity: [0, Validators.required],
      actualQuantity: [0],
      unitOfMeasure: ['', Validators.required],
      materialId: [0, Validators.required],
      productionVersionId: [0, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadProductOrders();
    this.loadMaterials();
    this.loadProductionVersions();
  }

  loadProductOrders(): void {
    this.apiService.getAllProductOrders().subscribe({
      next: (data) => this.productOrders.set(data),
      error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load: ' + err.message })
    });
  }

  loadMaterials(): void {
    this.apiService.getAllMaterials().subscribe({
      next: (data) => this.allMaterials.set(data),
      error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load materials: ' + err.message })
    });
  }

  loadProductionVersions(): void {
    this.apiService.getAllProductionVersions().subscribe({
      next: (data) => this.allProductionVersions.set(data),
      error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load production versions: ' + err.message })
    });
  }

  openCreateDialog(): void {
    this.productOrderForm.reset({
      orderDate: new Date().toISOString().split('T')[0],
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      plannedQuantity: 0,
      actualQuantity: 0,
      materialId: 0,
      productionVersionId: 0
    });
    this.displayFormDialog.set(true);
  }

  saveProductOrder(): void {
    if (this.productOrderForm.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Fill required fields' });
      return;
    }
    const dto: CreateProductOrderDto = this.productOrderForm.value;
    this.apiService.createProductOrder(dto).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Created' });
        this.loadProductOrders();
        this.displayFormDialog.set(false);
      },
      error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed: ' + (err.error?.message || err.message) })
    });
  }

  deleteProductOrder(order: ProductOrderDto): void {
    this.confirmationService.confirm({
      message: 'Delete this order?',
      accept: () => {
        this.apiService.deleteProductOrder(order.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Deleted' });
            this.loadProductOrders();
          },
          error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed: ' + (err.error?.message || err.message) })
        });
      }
    });
  }

  sendProductOrder(order: ProductOrderDto): void {
    this.apiService.sendProductOrder(order.id).subscribe({
      next: () => this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Sent' }),
      error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to send: ' + (err.error?.message || err.message) })
    });
  }

  requestProductOrder(order: ProductOrderDto): void {
    this.apiService.requestProductOrder(order.id).subscribe({
      next: () => this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Requested' }),
      error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to request: ' + (err.error?.message || err.message) })
    });
  }

  getMaterialLabel(material: MaterialDto): string {
    return material ? material.description : 'Unknown';
  }

  getProductionVersionLabel(pv: ProductionVersionDto): string {
    return pv ? pv.description : 'Unknown';
  }
}