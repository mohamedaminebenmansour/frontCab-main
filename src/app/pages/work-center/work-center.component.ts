import { Component, inject, signal, effect, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

// PrimeNG Standalone Components
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { Select } from 'primeng/select';

// Services
import { ConfirmationService, MessageService } from 'primeng/api';

// RxJS
import { Observable, Subject, takeUntil } from 'rxjs';

// App
import { ApiService } from '../../shared/services/api.service';
import { WorkCenterDto, CreateWorkCenterDto, UpdateWorkCenterDto } from '../../models';

// Type for ViewChild
import { Table } from 'primeng/table';

@Component({
  selector: 'app-work-center',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    TableModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    ProgressSpinnerModule,
    TagModule,
    TooltipModule,
    Button,
    InputText,
    InputNumber,
    ToggleSwitch,
    Select
  ],
  templateUrl: './work-center.component.html',
  styleUrls: ['./work-center.component.css'],
  providers: [MessageService, ConfirmationService]
})
export class WorkCenterComponent implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  @ViewChild('dt') table!: Table;

  // Signals
  workCenters = signal<WorkCenterDto[]>([]);
  selectedWorkCenter = signal<WorkCenterDto | null>(null);
  loading = signal<boolean>(false);
  displayDialog = signal<boolean>(false);
  isEditMode = signal<boolean>(false);

  // Form
  workCenterForm: FormGroup;

  // Dropdown data
  capacityUnits = ['Hours', 'Minutes', 'Pieces'];
  workCenterTypes = ['Machine', 'Labor', 'Assembly'];

  constructor() {
    // Initialize form with new fields
    this.workCenterForm = this.fb.group({
      id: [{ value: null, disabled: true }], // Read-only
      workCenterNumber: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      plant: ['', Validators.required],
      costCenter: ['', Validators.required],
      capacity: [0, [Validators.required, Validators.min(0)]],
      capacityUnit: ['', Validators.required],
      workCenterType: ['', Validators.required],
      isActive: [true],
      createdAt: [{ value: null, disabled: true }], // Read-only
      lastUpdated: [{ value: null, disabled: true }] // Read-only
    });

    // Effect: Auto-load on init
    effect(() => {
      if (!this.workCenters().length) {
        this.loadWorkCenters();
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    // Handled by effect
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Load list
  private loadWorkCenters(): void {
    this.loading.set(true);
    this.apiService.getWorkCenters().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        console.log('Loaded work centers:', data);
        this.workCenters.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.showWarning('Failed to load Work Centers: ' + err.message);
      }
    });
  }

  // Global table filter
  tableFilter(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.table.filterGlobal(target.value, 'contains');
  }

  // Open dialog for create/edit
  openDialog(workCenter?: WorkCenterDto): void {
    if (workCenter) {
      this.selectedWorkCenter.set(workCenter);
      this.isEditMode.set(true);
      this.workCenterForm.patchValue({
        ...workCenter,
        createdAt: workCenter.createdAt ? new Date(workCenter.createdAt) : null,
        lastUpdated: workCenter.lastUpdated ? new Date(workCenter.lastUpdated) : null
      });
    } else {
      this.selectedWorkCenter.set(null);
      this.isEditMode.set(false);
      this.workCenterForm.reset({ isActive: true, capacity: 0, id: null, createdAt: null, lastUpdated: null });
    }
    this.displayDialog.set(true);
  }

  // Save (create/update)
  save(): void {
    if (this.workCenterForm.invalid) {
      this.showWarning('Please fill all required fields correctly.');
      this.workCenterForm.markAllAsTouched();
      return;
    }

    const formValue = this.workCenterForm.getRawValue() as CreateWorkCenterDto | UpdateWorkCenterDto;
    let request: Observable<WorkCenterDto>;

    const selectedWorkCenter = this.selectedWorkCenter();
    if (this.isEditMode() && selectedWorkCenter?.id !== undefined) {
      console.log('Updating work center with ID:', selectedWorkCenter.id);
      request = this.apiService.updateWorkCenter(selectedWorkCenter.id, formValue as UpdateWorkCenterDto);
    } else {
      console.log('Creating new work center:', formValue);
      request = this.apiService.createWorkCenter(formValue as CreateWorkCenterDto);
    }

    request.pipe(takeUntil(this.destroy$)).subscribe({
      next: (saved) => {
        console.log('Save successful:', saved);
        this.displayDialog.set(false);
        this.loadWorkCenters();
        const msg = this.isEditMode() ? 'Work Center updated successfully!' : 'Work Center created successfully!';
        this.showSuccess(msg);
      },
      error: (err) => {
        console.error('Save failed:', err);
        this.showWarning('Save failed: ' + err.message);
      }
    });
  }

  // Delete with confirm
  delete(workCenter: WorkCenterDto): void {
    const workCenterId = workCenter.id;
    console.log('Attempting to delete work center:', { id: workCenterId, workCenterNumber: workCenter.workCenterNumber });

    if (workCenterId === undefined) {
      console.warn('Delete aborted: Work Center ID is missing.');
      this.showWarning('Cannot delete: Work Center ID is missing.');
      return;
    }

    console.log('Triggering confirm dialog for ID:', workCenterId);
    this.confirmationService.confirm({
      key: 'deleteConfirm',
      message: `Are you sure you want to delete ${workCenter.workCenterNumber}?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        console.log('Delete confirmed, calling API for ID:', workCenterId);
        this.apiService.deleteWorkCenter(workCenterId).pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            console.log('Delete successful for ID:', workCenterId);
            this.loadWorkCenters();
            this.showSuccess('Work Center deleted successfully!');
          },
          error: (err) => {
            console.error('Delete failed for ID:', workCenterId, 'Error:', err);
            this.showWarning('Delete failed: ' + err.message);
          }
        });
      },
      reject: () => {
        console.log('Delete cancelled for ID:', workCenterId);
        this.showWarning('Deletion cancelled.', `Work Center ${workCenter.workCenterNumber} was not deleted.`);
      }
    });
  }

  // Toast helpers
  private showSuccess(summary: string, detail?: string): void {
    this.messageService.add({
      severity: 'success',
      summary,
      detail,
      life: 4000,
      styleClass: 'custom-toast'
    });
  }

  private showWarning(summary: string, detail?: string): void {
    this.messageService.add({
      severity: 'warn',
      summary,
      detail,
      life: 6000,
      styleClass: 'custom-toast'
    });
  }
}
