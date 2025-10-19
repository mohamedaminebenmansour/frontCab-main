// src/app/pages/characteristic-assignment/characteristic-assignment.component.ts
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service';
import { CharacteristicAssignment } from '../../models/characteristic-assignment';
import { MaterialDto } from '../../models/material.model';
import { CharacteristicDto } from '../../models/characteristic.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-characteristic-assignment',
  templateUrl: './characteristic-assignment.component.html',
  styleUrls: ['./characteristic-assignment.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    TableModule,
    DialogModule,
    CheckboxModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule
  ],
  providers: [MessageService, ConfirmationService]
})
export class CharacteristicAssignmentComponent {
  assignments = signal<CharacteristicAssignment[]>([]);
  materials = signal<MaterialDto[]>([]);
  allCharacteristics = signal<CharacteristicDto[]>([]);
  availableCharacteristics = signal<CharacteristicDto[]>([]);
  assignmentForm: FormGroup;
  selectedAssignment = signal<CharacteristicAssignment | null>(null);
  isEditMode = signal<boolean>(false);
  displayFormDialog = signal<boolean>(false);

  private apiService = inject(ApiService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);

  constructor() {
    this.assignmentForm = this.fb.group({
      materialId: ['', Validators.required],
      characteristicId: ['', Validators.required],
      valueRange: ['', Validators.required],
      defaultValue: ['', Validators.required],
      unitOfMeasure: ['', Validators.required],
      isRequired: [false]
    });
  }

  ngOnInit(): void {
    this.loadAssignments();
    this.loadMaterials();
    this.loadCharacteristics();
  }

  loadAssignments(): void {
    this.apiService.getAllCharacteristicAssignments().subscribe({
      next: (data) => {
        this.assignments.set(data);
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load assignments' });
      }
    });
  }

  loadMaterials(): void {
    this.apiService.getAllMaterials().subscribe({
      next: (data) => {
        this.materials.set(data);
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load materials' });
      }
    });
  }

  loadCharacteristics(): void {
    this.apiService.getAllCharacteristics().subscribe({
      next: (data) => {
        this.allCharacteristics.set(data);
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load characteristics' });
      }
    });
  }

  onMaterialChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const materialId = Number(selectElement.value);
    this.handleMaterialChange(materialId);
  }

  private handleMaterialChange(materialId: number): void {
    if (materialId) {
      this.apiService.getAssignmentsByMaterialId(materialId).subscribe({
        next: (assigned) => {
          const assignedIds = assigned.map(a => a.characteristicId);
          this.availableCharacteristics.set(this.allCharacteristics().filter(c => 
            c.id !== undefined && !assignedIds.includes(c.id)
          ));
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load available characteristics' });
        }
      });
    } else {
      this.availableCharacteristics.set([]);
    }
  }

  openCreateDialog(): void {
    this.isEditMode.set(false);
    this.selectedAssignment.set(null);
    this.resetForm();
    this.displayFormDialog.set(true);
  }

  openEditDialog(assignment: CharacteristicAssignment): void {
    this.selectedAssignment.set(assignment);
    this.isEditMode.set(true);
    this.assignmentForm.patchValue(assignment);
    this.handleMaterialChange(assignment.materialId);
    
    const currentChar = this.allCharacteristics().find(c => c.id === assignment.characteristicId);
    if (currentChar) {
      this.availableCharacteristics.update(chars => [...chars, currentChar]);
    }
    
    this.displayFormDialog.set(true);
  }

  saveAssignment(): void {
    if (this.assignmentForm.invalid) return;
    
    const assignment: CharacteristicAssignment = this.assignmentForm.value;
    
    if (this.isEditMode() && this.selectedAssignment()) {
      this.apiService.updateCharacteristicAssignment(this.selectedAssignment()!.id!, assignment).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Assignment updated' });
          this.loadAssignments();
          this.displayFormDialog.set(false);
          this.resetForm();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update assignment: ' + (err.error?.message || err.message) });
        }
      });
    } else {
      this.apiService.createCharacteristicAssignment(assignment).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Assignment created' });
          this.loadAssignments();
          this.displayFormDialog.set(false);
          this.resetForm();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create assignment: ' + (err.error?.message || err.message) });
        }
      });
    }
  }

  deleteAssignment(assignment: CharacteristicAssignment): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this assignment?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      accept: () => {
        this.apiService.deleteCharacteristicAssignment(assignment.id!).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Assignment deleted' });
            this.loadAssignments();
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete assignment: ' + (err.error?.message || err.message) });
          }
        });
      }
    });
  }

  resetForm(): void {
    this.assignmentForm.reset();
    this.availableCharacteristics.set([]);
  }
}