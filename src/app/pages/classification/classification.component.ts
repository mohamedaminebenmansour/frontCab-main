// src/app/pages/classification/classification.component.ts

import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service';
import { ClassificationDto, CreateClassificationDto, UpdateClassificationDto } from '../../models/classification.model';
import { CharacteristicDto, CreateCharacteristicDto, UpdateCharacteristicDto } from '../../models/characteristic.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { Checkbox } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { Observable } from 'rxjs';

interface CharOption {
  label: string;
  value: number;
}

@Component({
  selector: 'app-classification',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    Button,
    TableModule,
    DialogModule,
    Checkbox,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule,
    InputText,
    Select,
    ToggleSwitch
  ],
  templateUrl: './classification.component.html',
  styleUrls: ['./classification.component.css'],
  providers: [MessageService, ConfirmationService]
})
export class ClassificationComponent {
  classifications = signal<ClassificationDto[]>([]);
  selectedClassification = signal<ClassificationDto | null>(null);
  showChars = signal<boolean>(false);
  classificationForm: FormGroup;
  displayFormDialog = signal<boolean>(false);
  displayCharDialog = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  isAssignMode = signal<boolean>(true);

  // Added signals for characteristic management
  allCharacteristics = signal<CharacteristicDto[]>([]);
  characteristicsForAssign = signal<CharOption[]>([]);
  characteristicsForRemove = signal<CharOption[]>([]);
  selectedCharId = signal<number>(0);

  // For characteristic edit/create
  characteristicForm: FormGroup;
  displayCharEditDialog = signal<boolean>(false);
  isCharEditMode = signal<boolean>(false);
  selectedChar = signal<CharacteristicDto | null>(null);
  dataTypes = ['String', 'Number', 'Date', 'Boolean'];
  characteristicGroups = ['Group1', 'Group2', 'Group3'];

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

  toggleDetails(classification: ClassificationDto): void {
    if (this.selectedClassification()?.id === classification.id) {
      this.selectedClassification.set(null);
      this.showChars.set(false);
    } else {
      this.selectedClassification.set(classification);
      this.showChars.set(false);
    }
  }

  toggleChars(): void {
    this.showChars.set(!this.showChars());
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

    const dto: CreateClassificationDto | UpdateClassificationDto = this.classificationForm.value;
    console.log('Saving classification with data:', dto);

    let request: Observable<any>;

    if (this.isEditMode() && this.selectedClassification()) {
      console.log('Updating classification ID:', this.selectedClassification()!.id);
      request = this.apiService.updateClassification(this.selectedClassification()!.id, dto as UpdateClassificationDto);
    } else {
      console.log('Creating new classification.');
      request = this.apiService.createClassification(dto as CreateClassificationDto);
    }

    request.subscribe({
      next: () => {
        console.log('Classification saved successfully.');
        this.messageService.add({ severity: 'success', summary: 'Success', detail: this.isEditMode() ? 'Classification updated' : 'Classification created' });
        this.loadClassifications();
        this.displayFormDialog.set(false);
      },
      error: (err) => {
        console.error('Error saving classification:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save' });
      }
    });
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
    this.selectedCharId.set(0);

    // Prepare options based on mode
    if (isAssign) {
      // Filter out already assigned characteristics for assign mode
      const assignedIds = new Set(classification.characteristics.map(c => c.id));
      console.log('Assigned characteristics ids:', Array.from(assignedIds));
      const available = this.allCharacteristics()
        .filter(c => !assignedIds.has(c.id))
        .map(c => ({
          label: `${c.characteristicNumber} - ${c.characteristicName || 'No Name'}`,
          value: c.id!
        }));
      this.characteristicsForAssign.set(available);
      console.log('Available characteristics for assign:', available);
    } else {
      // Use assigned characteristics for remove mode
      const assigned = classification.characteristics.map(c => ({
        label: `${c.characteristicNumber} - ${c.characteristicName || 'No Name'}`,
        value: c.id!
      }));
      this.characteristicsForRemove.set(assigned);
      console.log('Assigned characteristics for remove:', assigned);
    }

    this.displayCharDialog.set(true);
  }

  manageCharacteristic(): void {
    if (!this.selectedClassification() || !this.selectedCharId()) {
      console.warn('No characteristic selected. Cannot proceed.');
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please select a characteristic' });
      return;
    }

    const charId = this.selectedCharId();
    console.log(`Managing characteristic: ${charId} for classification ID: ${this.selectedClassification()!.id}. Mode: ${this.isAssignMode() ? 'Assign' : 'Remove'}`);

    let request: Observable<any>;

    if (this.isAssignMode()) {
      request = this.apiService.assignCharacteristic(this.selectedClassification()!.id, charId);
    } else {
      request = this.apiService.removeCharacteristic(this.selectedClassification()!.id, charId);
    }

    request.subscribe({
      next: () => {
        console.log(`Characteristic ${charId} ${this.isAssignMode() ? 'assigned' : 'removed'} successfully.`);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: `Characteristic ${this.isAssignMode() ? 'assigned' : 'removed'}` });
        this.loadClassifications(); // Reload to update characteristics list
        this.displayCharDialog.set(false);
      },
      error: (err) => {
        console.error(`Error ${this.isAssignMode() ? 'assigning' : 'removing'} characteristic ${charId}:`, err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: `Failed to ${this.isAssignMode() ? 'assign' : 'remove'}` });
      }
    });
  }

  removeCharacteristicDirect(classId: number, charId: number): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to remove this characteristic from the classification?`,
      accept: () => {
        this.apiService.removeCharacteristic(classId, charId).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Characteristic removed' });
            this.loadClassifications();
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to remove' });
          }
        });
      }
    });
  }

  openCharEditDialog(char?: CharacteristicDto): void {
    if (char) {
      this.isCharEditMode.set(true);
      this.selectedChar.set(char);
      this.characteristicForm.patchValue({
        ...char,
        validityStartDate: char.validityStartDate ? new Date(char.validityStartDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        validityEndDate: char.validityEndDate ? new Date(char.validityEndDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        createdAt: char.createdAt ? new Date(char.createdAt) : null,
        lastUpdated: char.lastUpdated ? new Date(char.lastUpdated) : null
      });
    } else {
      this.isCharEditMode.set(false);
      this.selectedChar.set(null);
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
    this.displayCharEditDialog.set(true);
  }

  saveCharacteristic(): void {
    if (this.characteristicForm.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please fill all required fields correctly.' });
      this.characteristicForm.markAllAsTouched();
      return;
    }

    const formValue = this.characteristicForm.getRawValue() as CreateCharacteristicDto | UpdateCharacteristicDto;
    let request: Observable<any>;

    if (this.isCharEditMode()) {
      const charId = this.selectedChar()?.id;
      if (charId === undefined) return;
      console.log('Updating characteristic with ID:', charId, 'Data:', formValue);
      request = this.apiService.updateCharacteristic(charId, formValue as UpdateCharacteristicDto);
    } else {
      console.log('Creating new characteristic:', formValue);
      request = this.apiService.createCharacteristic(formValue as CreateCharacteristicDto);
    }

    request.subscribe({
      next: (response) => {
        console.log('Save successful:', response);
        this.displayCharEditDialog.set(false);
        if (!this.isCharEditMode() && this.selectedClassification()) {
          // Since create doesn't return id, need to reload characteristics and find the new one by number
          this.loadCharacteristics();
          const charNumber = formValue.characteristicNumber;
          // Wait a bit or use complete to find id
          setTimeout(() => {
            const newChar = this.allCharacteristics().find(c => c.characteristicNumber === charNumber);
            if (newChar && newChar.id) {
              this.apiService.assignCharacteristic(this.selectedClassification()!.id, newChar.id).subscribe({
                next: () => {
                  console.log('Assigned new characteristic to classification');
                  this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Characteristic created and assigned successfully!' });
                },
                error: (err) => {
                  console.error('Assign failed:', err);
                  this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Characteristic created but assign failed: ' + err.message });
                }
              });
            } else {
              this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Characteristic created but could not find ID for assignment' });
            }
          }, 1000); // Delay to allow backend to save
        } else {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Characteristic updated successfully!' });
        }
        this.loadClassifications();
        this.loadCharacteristics(); // Reload all characteristics after create/update
      },
      error: (err) => {
        console.error('Save failed:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Save failed: ' + err.message });
      }
    });
  }

  getStatusLabel(status: number): string {
    const label = this.classStatusOptions.find(opt => opt.value === status)?.label || 'Unknown';
    console.log(`Getting status label for ${status}: ${label}`);
    return label;
  }
}