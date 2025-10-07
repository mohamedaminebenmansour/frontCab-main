import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service';
import { EWM_StorageType, EWM_Aturized_Status } from '../../models';

@Component({
  selector: 'app-ewm-storage-type',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ewm-storage-type.component.html'
})
export class EwmStorageTypeComponent implements OnInit {
  storageTypesList: EWM_StorageType[] = [];
  selectedType: EWM_StorageType = {
    code: '',
    lib: '',
    codeAuthorizedStatus: '',
    validateByQuality: true,
    withCheckAuthorizedStatus: false,
    noInputRewinding: false,
    isIncomplete: false,
    idewmAturizedStatus: undefined
  };
  aturizedStatuses: EWM_Aturized_Status[] = [];
  isFormVisible = false;
  isEditing = false;
  alertMessage: string | null = null;
  alertType: 'success' | 'error' | null = null;

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    console.log('Component initialized - loading storage types and aturized statuses');
    this.loadStorageTypes();
    this.loadAturizedStatuses();
  }

  loadStorageTypes(): void {
    console.log('Loading Storage Types');
    this.apiService.getStorageTypes().subscribe({
      next: (data) => {
        console.log('Loaded storage types:', data);
        this.storageTypesList = data.map(d => {
          const item: EWM_StorageType = {
            ...d,
            idewmAturizedStatus: (d as any).idewm_Aturized_Status != null ? Number((d as any).idewm_Aturized_Status) : undefined,
            codeAuthorizedStatus: (d as any).codeAtorisedStatus || ''  // Map backend spelling to frontend
          };
          return item;
        });
        this.storageTypesList.forEach(item => {
          console.log(`Item ID: ${item.id}, idewmAturizedStatus: ${item.idewmAturizedStatus}, codeAuthorizedStatus: ${item.codeAuthorizedStatus}`);
        });
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading storage types:', err);
        this.showAlert('error', `Failed to load storage types: ${err.message}`);
      }
    });
  }

  loadAturizedStatuses(): void {
    console.log('Loading Aturized Statuses');
    this.apiService.getAturizedStatusesFromStorageType().subscribe({
      next: (data) => {
        console.log('Loaded aturized statuses:', data);
        if (data.length > 0) {
          console.log('First aturized status:', JSON.stringify(data[0]));
        } else {
          console.log('No aturized statuses loaded');
        }
        this.aturizedStatuses = data.map(d => {
          const s: EWM_Aturized_Status = {...d};
          s.idewm_Aturized_Status = d.idewm_Aturized_Status != null ? Number(d.idewm_Aturized_Status) : undefined;
          return s;
        });
        console.log('Mapped aturized statuses IDs:', this.aturizedStatuses.map(s => s.idewm_Aturized_Status));
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading aturized statuses:', err);
        this.showAlert('error', `Failed to load aturized statuses: ${err.message}`);
      }
    });
  }

  toggleForm(): void {
    console.log('Toggling form visibility:', !this.isFormVisible);
    if (!this.isFormVisible && !this.isEditing) {
      console.log('Form opened for creation - before init: current selectedType:', JSON.stringify(this.selectedType));
    }
    this.isFormVisible = !this.isFormVisible;
    if (!this.isFormVisible) {
      this.resetForm();
    } else if (!this.isEditing) {
      console.log('Form opened for Add New Type - initial selectedType after toggle:', JSON.stringify(this.selectedType));
    }
  }

  resetForm(): void {
    console.log('Resetting form');
    this.selectedType = {
      code: '',
      lib: '',
      codeAuthorizedStatus: '',
      validateByQuality: true,
      withCheckAuthorizedStatus: false,
      noInputRewinding: false,
      isIncomplete: false,
      idewmAturizedStatus: undefined
    };
    this.isEditing = false;
  }

  saveType(): void {
    console.log('Save clicked - form state before any processing:', JSON.stringify(this.selectedType));
    if (!this.selectedType.code || !this.selectedType.lib) {
      console.warn('Validation failed: Code and Libelle required');
      this.showAlert('error', 'Code and Libelle are required');
      return;
    }
    if (this.selectedType.idewmAturizedStatus === undefined) {
      console.warn('Validation failed: Aturized Status required');
      this.showAlert('error', 'Please select an Aturized Status');
      return;
    }

    console.log('Form state after validation - selectedType:', JSON.stringify(this.selectedType));
    const typeToSend = {
      id: this.selectedType.id,
      code: this.selectedType.code,
      lib: this.selectedType.lib,
      codeAuthorizedStatus: this.selectedType.codeAuthorizedStatus || undefined,
      codeAtorisedStatus: this.selectedType.codeAuthorizedStatus || undefined,  // Send both to handle DTO duplicate
      idewm_Aturized_Status: this.selectedType.idewmAturizedStatus || undefined,  // Match backend/log casing
      validateByQuality: this.selectedType.validateByQuality,
      withCheckAuthorizedStatus: this.selectedType.withCheckAuthorizedStatus,
      noInputRewinding: this.selectedType.noInputRewinding,
      isIncomplete: this.selectedType.isIncomplete
    };
    console.log('Preparing payload - typeToSend JSON before send:', JSON.stringify(typeToSend));

    if (this.isEditing && this.selectedType.id) {
      console.log('Updating type with ID:', this.selectedType.id);
      this.apiService
        .updateStorageType(this.selectedType.id, typeToSend)
        .subscribe({
          next: (updated) => {
            console.log('Backend response - Updated type:', updated);
            const mappedUpdated: EWM_StorageType = {
              ...updated,
              idewmAturizedStatus: (updated as any).idewm_Aturized_Status != null ? Number((updated as any).idewm_Aturized_Status) : undefined,
              codeAuthorizedStatus: (updated as any).codeAtorisedStatus || ''
            };
            this.storageTypesList = this.storageTypesList.map((t) =>
              t.id === mappedUpdated.id ? mappedUpdated : t
            );
            this.showAlert('success', 'Storage Type updated successfully');
            this.toggleForm();
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Error updating type:', err);
            this.showAlert('error', `Failed to update type: ${err.message}`);
          }
        });
    } else {
      console.log('Creating new type');
      this.apiService.createStorageType(typeToSend).subscribe({
        next: (created) => {
          console.log('Backend response - Created type:', created);
          const mappedCreated: EWM_StorageType = {
            ...created,
            idewmAturizedStatus: (created as any).idewm_Aturized_Status != null ? Number((created as any).idewm_Aturized_Status) : undefined,
            codeAuthorizedStatus: (created as any).codeAtorisedStatus || ''
          };
          this.storageTypesList.push(mappedCreated);
          this.showAlert('success', 'Storage Type created successfully');
          this.toggleForm();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error creating type:', err);
          this.showAlert('error', `Failed to create type: ${err.message}`);
        }
      });
    }
  }

  editType(type: EWM_StorageType): void {
    console.log('Editing type:', type);
    this.selectedType = { ...type };
    this.isEditing = true;
    this.isFormVisible = true;
    this.onAturizedStatusChange();
  }

  deleteType(id: number): void {
    console.log('Initiating delete for ID:', id);
    if (confirm('Are you sure you want to delete this storage type?')) {
      this.apiService.deleteStorageType(id).subscribe({
        next: () => {
          console.log('Delete successful for ID:', id);
          this.storageTypesList = this.storageTypesList.filter((t) => t.id !== id);
          this.showAlert('success', 'Storage Type deleted successfully');
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error deleting type:', err);
          this.showAlert('error', `Failed to delete type: ${err.message}`);
        }
      });
    } else {
      console.log('Delete cancelled for ID:', id);
    }
  }

  showAlert(type: 'success' | 'error', message: string): void {
    console.log('Showing alert:', type, message);
    this.alertType = type;
    this.alertMessage = message;
    setTimeout(() => {
      this.alertMessage = null;
      this.alertType = null;
      this.cdr.detectChanges();
    }, 3000);
  }

  getAturizedStatusLabel(id: number | undefined): string {
    if (!id) {
      return '-';
    }
    const status = this.aturizedStatuses.find(s => s.idewm_Aturized_Status === id);
    return status ? status.valueAtorisedStatus : 'Unknown';
  }

  onAturizedStatusChange(selectedId?: number): void {
    const id = selectedId !== undefined ? selectedId : this.selectedType.idewmAturizedStatus;
    console.log('Aturized Status selection change started - before update: codeAuthorizedStatus=', this.selectedType.codeAuthorizedStatus, ', idewmAturizedStatus=', this.selectedType.idewmAturizedStatus);
    console.log('Selected ID from event:', selectedId, 'type:', typeof selectedId);
    console.log('Available statuses IDs:', this.aturizedStatuses.map(s => s.idewm_Aturized_Status));
    if (id != null) {
      const status = this.aturizedStatuses.find(s => s.idewm_Aturized_Status === id);
      console.log('Found status:', status);
      if (status) {
        this.selectedType.codeAuthorizedStatus = status.codeAtorisedStatus.replace(/^"|"$/g, '');
      }
    } else {
      this.selectedType.codeAuthorizedStatus = '';
    }
    console.log('Aturized Status selection change completed - after update: codeAuthorizedStatus=', this.selectedType.codeAuthorizedStatus, ', idewmAturizedStatus=', id);
    this.cdr.detectChanges();
  }
}