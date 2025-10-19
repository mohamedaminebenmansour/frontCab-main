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
import { CharacteristicDto, CreateCharacteristicDto, UpdateCharacteristicDto } from '../../models';

// Type for ViewChild
import { Table } from 'primeng/table';

@Component({
  selector: 'app-characteristic',
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
  templateUrl: './characteristic.component.html',
  styleUrls: ['./characteristic.component.css'],
  providers: [MessageService, ConfirmationService]
})
export class CharacteristicComponent implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  @ViewChild('dt') table!: Table;

  // Signals
  characteristics = signal<CharacteristicDto[]>([]);
  selectedCharacteristic = signal<CharacteristicDto | null>(null);
  loading = signal<boolean>(false);
  displayDialog = signal<boolean>(false);
  isEditMode = signal<boolean>(false);

  // Form
  characteristicForm: FormGroup;

  // Dropdown data (adapt based on backend enums)
  dataTypes = ['String', 'Number', 'Date', 'Boolean'];
  characteristicGroups = ['Group1', 'Group2', 'Group3'];

  constructor() {
    this.characteristicForm = this.fb.group({
      id: [{ value: null, disabled: true }], // Read-only
      characteristicNumber: ['', [Validators.required, Validators.minLength(3)]],
      characteristicName: ['', Validators.required],
      dataType: ['', Validators.required],
      characteristicDescription: ['', Validators.required],
      valueRange: [''],
      defaultValue: [''],
      unitOfMeasure: [''],
      isRequired: [false],
      isSingleValue: [false],
      characteristicGroup: ['', Validators.required],
      validityStartDate: [new Date().toISOString().split('T')[0], Validators.required], // Format for input type="date"
      validityEndDate: [new Date().toISOString().split('T')[0], Validators.required], // Format for input type="date"
      createdAt: [{ value: null, disabled: true }], // Read-only
      lastUpdated: [{ value: null, disabled: true }] // Read-only
    });

    effect(() => {
      if (!this.characteristics().length) {
        this.loadCharacteristics();
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

  private loadCharacteristics(): void {
    this.loading.set(true);
    this.apiService.getCharacteristics().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        console.log('Test: Loaded characteristics:', data);
        this.characteristics.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Test: Load characteristics failed:', err);
        this.loading.set(false);
        this.showWarning('Failed to load Characteristics: ' + err.message);
      }
    });
  }

  tableFilter(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.table.filterGlobal(target.value, 'contains');
  }

  openDialog(characteristic?: CharacteristicDto): void {
    if (characteristic) {
      this.selectedCharacteristic.set(characteristic);
      this.isEditMode.set(true);
      this.characteristicForm.patchValue({
        ...characteristic,
        validityStartDate: characteristic.validityStartDate ? new Date(characteristic.validityStartDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        validityEndDate: characteristic.validityEndDate ? new Date(characteristic.validityEndDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        createdAt: characteristic.createdAt ? new Date(characteristic.createdAt) : null,
        lastUpdated: characteristic.lastUpdated ? new Date(characteristic.lastUpdated) : null
      });
    } else {
      this.selectedCharacteristic.set(null);
      this.isEditMode.set(false);
      this.characteristicForm.reset({
        isRequired: false,
        isSingleValue: false,
        validityStartDate: new Date().toISOString().split('T')[0],
        validityEndDate: new Date().toISOString().split('T')[0],
        id: null,
        createdAt: null,
        lastUpdated: null
      });
    }
    this.displayDialog.set(true);
  }

// src/app/pages/characteristic/characteristic.component.ts
// Updated: Change request to Observable<any> in save and delete
// On success, reload list without using returned value (since backend returns string)
// Kept all logs and functionality

// ... (rest of imports and class remain the same) ...

save(): void {
  if (this.characteristicForm.invalid) {
    this.showWarning('Please fill all required fields correctly.');
    this.characteristicForm.markAllAsTouched();
    return;
  }

  const formValue = this.characteristicForm.getRawValue() as CreateCharacteristicDto | UpdateCharacteristicDto;
  let request: Observable<any>; // Changed to any

  const selectedCharacteristic = this.selectedCharacteristic();
  if (this.isEditMode() && selectedCharacteristic?.id !== undefined) {
    console.log('Test: Updating characteristic with ID:', selectedCharacteristic.id, 'Data:', formValue);
    request = this.apiService.updateCharacteristic(selectedCharacteristic.id, formValue as UpdateCharacteristicDto);
  } else {
    console.log('Test: Creating new characteristic:', formValue);
    request = this.apiService.createCharacteristic(formValue as CreateCharacteristicDto);
  }

  request.pipe(takeUntil(this.destroy$)).subscribe({
    next: (response) => {
      console.log('Test: Save successful:', response); // Logs the string response
      this.displayDialog.set(false);
      this.loadCharacteristics();
      const msg = this.isEditMode() ? 'Characteristic updated successfully!' : 'Characteristic created successfully!';
      this.showSuccess(msg);
    },
    error: (err) => {
      console.error('Test: Save failed:', err);
      this.showWarning('Save failed: ' + err.message);
    }
  });
}

delete(characteristic: CharacteristicDto): void {
  const characteristicId = characteristic.id;
  console.log('Test: Attempting to delete characteristic:', { id: characteristicId, characteristicNumber: characteristic.characteristicNumber });

  if (characteristicId === undefined) {
    console.warn('Test: Delete aborted: Characteristic ID is missing.');
    this.showWarning('Cannot delete: Characteristic ID is missing.');
    return;
  }

  console.log('Test: Triggering confirm dialog for ID:', characteristicId);
  this.confirmationService.confirm({
    key: 'deleteConfirm',
    message: `Are you sure you want to delete ${characteristic.characteristicNumber}?`,
    header: 'Confirm Delete',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Yes',
    rejectLabel: 'No',
    accept: () => {
      console.log('Test: Delete confirmed, calling API for ID:', characteristicId);
      this.apiService.deleteCharacteristic(characteristicId).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          console.log('Test: Delete successful for ID:', characteristicId, response); // Logs the string response
          this.loadCharacteristics();
          this.showSuccess('Characteristic deleted successfully!');
        },
        error: (err) => {
          console.error('Test: Delete failed for ID:', characteristicId, 'Error:', err);
          this.showWarning('Delete failed: ' + err.message);
        }
      });
    },
    reject: () => {
      console.log('Test: Delete cancelled for ID:', characteristicId);
      this.showWarning('Deletion cancelled.', `Characteristic ${characteristic.characteristicNumber} was not deleted.`);
    }
  });
}

// ... (rest of the class remains the same)
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
