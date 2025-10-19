// src/app/pages/routing/routing.component.ts
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service';
import { RoutingDto, CreateRoutingDto } from '../../models/routing.model';
import { WorkCenterDto } from '../../models/work-center.model';
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
  selector: 'app-routing',
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
  templateUrl: './routing.component.html',
  styleUrls: ['./routing.component.css'],
  providers: [MessageService, ConfirmationService]
})
export class RoutingComponent {
  routings = signal<RoutingDto[]>([]);
  selectedRouting = signal<RoutingDto | null>(null);
  routingForm: FormGroup;
  displayFormDialog = signal<boolean>(false);
  displayWorkCenterDialog = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  isAddMode = signal<boolean>(true);
  selectedWorkCenterId = signal<number>(0);

  allWorkCenters = signal<WorkCenterDto[]>([]);
  workCentersForAdd = signal<Option[]>([]);
  workCentersForRemove = signal<Option[]>([]);

  private apiService = inject(ApiService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);

  constructor() {
    this.routingForm = this.fb.group({
      routingNumber: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadRoutings();
    this.loadWorkCenters();
  }

  loadRoutings(): void {
    this.apiService.getAllRoutings().subscribe({
      next: (data: RoutingDto[]) => this.routings.set(data),
      error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load routings: ' + err.message })
    });
  }

  loadWorkCenters(): void {
    this.apiService.getWorkCenters().subscribe({
      next: (data: WorkCenterDto[]) => this.allWorkCenters.set(data),
      error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load work centers: ' + err.message })
    });
  }

  openCreateDialog(): void {
    this.isEditMode.set(false);
    this.routingForm.reset();
    this.displayFormDialog.set(true);
  }

  openEditDialog(routing: RoutingDto): void {
    this.selectedRouting.set(routing);
    this.isEditMode.set(true);
    this.routingForm.patchValue({
      routingNumber: routing.routingNumber,
      description: routing.description
    });
    this.displayFormDialog.set(true);
  }

  saveRouting(): void {
    if (this.routingForm.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please fill all required fields' });
      return;
    }

    const formValue: CreateRoutingDto = this.routingForm.value;

    if (this.isEditMode()) {
      this.apiService.updateRouting(this.selectedRouting()!.id, formValue).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Routing updated' });
          this.loadRoutings();
          this.displayFormDialog.set(false);
        },
        error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update: ' + (err.error?.message || err.message) })
      });
    } else {
      this.apiService.createRouting(formValue).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Routing created' });
          this.loadRoutings();
          this.displayFormDialog.set(false);
        },
        error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create: ' + (err.error?.message || err.message) })
      });
    }
  }

  deleteRouting(routing: RoutingDto): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this routing?',
      accept: () => {
        this.apiService.deleteRouting(routing.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Routing deleted' });
            this.loadRoutings();
          },
          error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete: ' + (err.error?.message || err.message) })
        });
      }
    });
  }

  openWorkCenterDialog(routing: RoutingDto, isAdd: boolean): void {
    this.selectedRouting.set(routing);
    this.isAddMode.set(isAdd);
    this.selectedWorkCenterId.set(0);

    const assignedIds = new Set(routing.workCenters?.map(wc => wc.id) || []);

    if (isAdd) {
      const available = this.allWorkCenters()
        .filter(wc => wc.id !== undefined && !assignedIds.has(wc.id))
        .map(wc => ({ label: `${wc.description} (ID: ${wc.id})`, value: wc.id! }));
      this.workCentersForAdd.set(available);
    } else {
      const assigned = routing.workCenters?.filter(wc => wc.id !== undefined).map(wc => ({ label: `${wc.description} (ID: ${wc.id})`, value: wc.id! })) || [];
      this.workCentersForRemove.set(assigned);
    }

    this.displayWorkCenterDialog.set(true);
  }

  manageWorkCenter(): void {
    if (!this.selectedRouting() || !this.selectedWorkCenterId()) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please select a work center' });
      return;
    }

    const workCenterId = this.selectedWorkCenterId();
    const routingId = this.selectedRouting()!.id;

    if (this.isAddMode()) {
      this.apiService.addWorkCenterToRouting(routingId, workCenterId).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Work center added' });
          this.loadRoutings();
          this.displayWorkCenterDialog.set(false);
        },
        error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to add: ' + (err.error?.message || err.message) })
      });
    } else {
      this.apiService.removeWorkCenterFromRouting(routingId, workCenterId).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Work center removed' });
          this.loadRoutings();
          this.displayWorkCenterDialog.set(false);
        },
        error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to remove: ' + (err.error?.message || err.message) })
      });
    }
  }

  getWorkCenterLabel(workCenterId: number): string {
    return this.allWorkCenters().find(wc => wc.id === workCenterId)?.description || 'Unknown';
  }
}