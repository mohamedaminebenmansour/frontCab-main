// src/app/pages/classification/classification.component.ts

import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service'; // Adjust path if needed
import { ClassificationDto, CreateClassificationDto } from '../../models/classification.model';
import { CharacteristicDto } from '../../models/characteristic.model'; // Added import for CharacteristicDto
import { ConfirmationService, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button'; // Changed to ButtonModule for consistency (assuming PrimeNG modules)
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox'; // Changed to CheckboxModule
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';

interface CharOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-classification',
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
  templateUrl: './classification.component.html',
  styleUrls: ['./classification.component.css'],
  providers: [MessageService, ConfirmationService]
})
export class ClassificationComponent {
  classifications = signal<ClassificationDto[]>([]);
  selectedClassification = signal<ClassificationDto | null>(null);
  classificationForm: FormGroup;
  displayFormDialog = signal<boolean>(false);
  displayCharDialog = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  isAssignMode = signal<boolean>(true);

  // Added signals for characteristic management
  allCharacteristics = signal<CharacteristicDto[]>([]);
  characteristicsForAssign = signal<CharOption[]>([]);
  characteristicsForRemove = signal<CharOption[]>([]);
  selectedCharNumber = signal<string>('');

  classStatusOptions = [
    { label: 'ACTIVE', value: 0 },
    { label: 'INACTIVE', value: 1 },
    { label: 'UNDER_REVISION', value: 2 },
    { label: 'LOCKED', value: 3 },
    { label: 'DELETED', value: 4 },
    { label: 'PENDING_APPROVAL', value: 5 },
    { label: 'APPROVED', value: 6 },
    { label: 'REJECTED', value: 7 }
  ];

  private apiService = inject(ApiService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);

  constructor() {
    this.classificationForm = this.fb.group({
      classNumber: ['', Validators.required],
      className: ['', Validators.required],
      classDescription: [''],
      classStatus: [0, Validators.required],
      classGroup: [''],
      classHierarchy: [''],
      classUsage: [''],
      classKeyDate: [new Date().toISOString().split('T')[0], Validators.required],
      validityStartDate: [new Date().toISOString().split('T')[0], Validators.required],
      validityEndDate: [new Date().toISOString().split('T')[0], Validators.required],
      isInherited: [false],
      classAuthorizationGroup: ['']
    });
  }

  ngOnInit(): void {
    console.log('Component initialized. Loading classifications and characteristics...');
    this.loadClassifications();
    this.loadCharacteristics(); // Added to load all characteristics once on init
  }

  loadClassifications(): void {
    console.log('Loading all classifications from API...');
    this.apiService.getClassifications().subscribe({
      next: (data) => {
        console.log('Classifications loaded successfully:', data);
        this.classifications.set(data);
      },
      error: (err) => {
        console.error('Error loading classifications:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load classifications' });
      }
    });
  }

  // Added method to load all characteristics from the API
  loadCharacteristics(): void {
    console.log('Loading all characteristics from API for assignment options...');
    this.apiService.getCharacteristics().subscribe({
      next: (data) => {
        console.log('All characteristics loaded successfully:', data);
        this.allCharacteristics.set(data);
      },
      error: (err) => {
        console.error('Error loading characteristics:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load characteristics' });
      }
    });
  }

  openCreateDialog(): void {
    console.log('Opening create classification dialog...');
    this.isEditMode.set(false);
    this.selectedClassification.set(null);
    this.classificationForm.reset({
      classStatus: 0,
      isInherited: false,
      classKeyDate: new Date().toISOString().split('T')[0],
      validityStartDate: new Date().toISOString().split('T')[0],
      validityEndDate: new Date().toISOString().split('T')[0]
    });
    this.displayFormDialog.set(true);
  }

  openEditDialog(classification: ClassificationDto): void {
    console.log('Opening edit dialog for classification:', classification.id);
    this.isEditMode.set(true);
    this.selectedClassification.set(classification);
    this.classificationForm.patchValue({
      ...classification,
      classKeyDate: new Date(classification.classKeyDate).toISOString().split('T')[0],
      validityStartDate: new Date(classification.validityStartDate).toISOString().split('T')[0],
      validityEndDate: new Date(classification.validityEndDate).toISOString().split('T')[0]
    });
    this.displayFormDialog.set(true);
  }

  saveClassification(): void {
    if (this.classificationForm.invalid) {
      console.warn('Form invalid. Cannot save classification.');
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please fill all required fields' });
      this.classificationForm.markAllAsTouched();
      return;
    }

    const dto: CreateClassificationDto = this.classificationForm.value;
    console.log('Saving classification with data:', dto);

    if (this.isEditMode() && this.selectedClassification()) {
      console.log('Updating classification ID:', this.selectedClassification()!.id);
      this.apiService.updateClassification(this.selectedClassification()!.id, dto).subscribe({
        next: () => {
          console.log('Classification updated successfully.');
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Classification updated' });
          this.loadClassifications();
          this.displayFormDialog.set(false);
        },
        error: (err) => {
          console.error('Error updating classification:', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update' });
        }
      });
    } else {
      console.log('Creating new classification.');
      this.apiService.createClassification(dto).subscribe({
        next: () => {
          console.log('Classification created successfully.');
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Classification created' });
          this.loadClassifications();
          this.displayFormDialog.set(false);
        },
        error: (err) => {
          console.error('Error creating classification:', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create' });
        }
      });
    }
  }

  deleteClassification(classification: ClassificationDto): void {
    console.log('Confirming deletion for classification ID:', classification.id);
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this classification?',
      accept: () => {
        console.log('Deleting classification ID:', classification.id);
        this.apiService.deleteClassification(classification.id).subscribe({
          next: () => {
            console.log('Classification deleted successfully.');
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Classification deleted' });
            this.loadClassifications();
          },
          error: (err) => {
            console.error('Error deleting classification:', err);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete' });
          }
        });
      }
    });
  }

  openCharDialog(classification: ClassificationDto, isAssign: boolean): void {
    console.log(`Opening characteristic dialog for classification ID: ${classification.id}. Mode: ${isAssign ? 'Assign' : 'Remove'}`);
    this.selectedClassification.set(classification);
    this.isAssignMode.set(isAssign);
    this.selectedCharNumber.set('');

    // Prepare options based on mode
    if (isAssign) {
      // Filter out already assigned characteristics for assign mode
      const assignedNumbers = new Set(classification.characteristics.map(c => c.characteristicNumber));
      console.log('Assigned characteristics numbers:', Array.from(assignedNumbers));
      const available = this.allCharacteristics()
        .filter(c => !assignedNumbers.has(c.characteristicNumber))
        .map(c => ({
          label: `${c.characteristicNumber} - ${c.characteristicName || 'No Name'}`,
          value: c.characteristicNumber
        }));
      this.characteristicsForAssign.set(available);
      console.log('Available characteristics for assign:', available);
    } else {
      // Use assigned characteristics for remove mode
      const assigned = classification.characteristics.map(c => ({
        label: `${c.characteristicNumber} - ${c.characteristicName || 'No Name'}`,
        value: c.characteristicNumber
      }));
      this.characteristicsForRemove.set(assigned);
      console.log('Assigned characteristics for remove:', assigned);
    }

    this.displayCharDialog.set(true);
  }

  manageCharacteristic(): void {
    if (!this.selectedClassification() || !this.selectedCharNumber()) {
      console.warn('No characteristic selected. Cannot proceed.');
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please select a characteristic' });
      return;
    }

    const charNumber = this.selectedCharNumber();
    console.log(`Managing characteristic: ${charNumber} for classification ID: ${this.selectedClassification()!.id}. Mode: ${this.isAssignMode() ? 'Assign' : 'Remove'}`);

    if (this.isAssignMode()) {
      this.apiService.assignCharacteristic(this.selectedClassification()!.id, charNumber).subscribe({
        next: () => {
          console.log(`Characteristic ${charNumber} assigned successfully.`);
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Characteristic assigned' });
          this.loadClassifications(); // Reload to update characteristics list
          this.displayCharDialog.set(false);
        },
        error: (err) => {
          console.error(`Error assigning characteristic ${charNumber}:`, err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to assign' });
        }
      });
    } else {
      this.apiService.removeCharacteristic(this.selectedClassification()!.id, charNumber).subscribe({
        next: () => {
          console.log(`Characteristic ${charNumber} removed successfully.`);
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Characteristic removed' });
          this.loadClassifications(); // Reload to update characteristics list
          this.displayCharDialog.set(false);
        },
        error: (err) => {
          console.error(`Error removing characteristic ${charNumber}:`, err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to remove' });
        }
      });
    }
  }

  getStatusLabel(status: number): string {
    const label = this.classStatusOptions.find(opt => opt.value === status)?.label || 'Unknown';
    console.log(`Getting status label for ${status}: ${label}`);
    return label;
  }
}