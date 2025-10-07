import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service';
import { StorageTypeRuleCreateDTO, StorageTypeRuleResponseDTO } from '../../models/ewm-storage-type-rules.model';

@Component({
  selector: 'app-ewm-storage-type-rules',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './ewm-storage-type-rules.component.html',
})
export class EwmStorageTypeRulesComponent implements OnInit {
  rules: StorageTypeRuleResponseDTO[] = [];
  filteredRules: StorageTypeRuleResponseDTO[] = [];
  typeCodes: string[] = [];
  ruleForm: FormGroup;
  showModal = false;
  isEditMode = false;
  selectedId?: number;
  filterType = 'All';
  searchTerm = '';

  // Checkbox states
  typeStates: { [key: string]: { allowed: boolean; blocked: boolean } } = {};

  constructor(private apiService: ApiService, private fb: FormBuilder) {
    this.ruleForm = this.fb.group({
      ewm_Code_StorageType_From: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadRules();
    this.loadTypeCodes();
  }

  loadRules(): void {
    this.apiService.getStorageTypeRuless().subscribe({
      next: (rules) => {
        console.log('Loaded rules successfully:', rules);
        // Transform data: Add lowercase 'm' property from backend's uppercase 'M'
        this.rules = rules.map(rule => ({
          ...rule,
          ewm_Code_StorageType_From: rule.ewM_Code_StorageType_From
        }));
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error loading rules:', err);
      }
    });
  }

  loadTypeCodes(): void {
    this.apiService.getStorageTypes().subscribe({
      next: (types) => {
        console.log('Loaded type codes successfully:', types);
        this.typeCodes = [...new Set(types.map((type: any) => type.code).filter(Boolean))];
        this.resetTypeStates();
      },
      error: (err) => {
        console.error('Error loading type codes:', err);
      }
    });
  }

  applyFilters(): void {
    console.log('Applying filters with filterType:', this.filterType, 'searchTerm:', this.searchTerm);
    let temp = this.rules;
    if (this.filterType !== 'All') {
      temp = temp.filter((rule) => rule.ewM_Code_StorageType_From === this.filterType);
    }
    if (this.searchTerm) {
      const lowerSearch = this.searchTerm.toLowerCase();
      temp = temp.filter(
        (rule) =>
          rule.ewM_Code_StorageType_From?.toLowerCase().includes(lowerSearch) ||
          rule.allowTranferTO?.toLowerCase().includes(lowerSearch) ||
          rule.blockTranferTO?.toLowerCase().includes(lowerSearch)
      );
    }
    this.filteredRules = temp;
  }

  openModal(rule?: StorageTypeRuleResponseDTO): void {
    console.log('Opening modal, edit mode:', this.isEditMode, 'rule:', rule);
    this.resetTypeStates();
    if (rule) {
      this.isEditMode = true;
      this.selectedId = rule.idewm_Location_Rules;
      this.ruleForm.patchValue({ ewm_Code_StorageType_From: rule.ewM_Code_StorageType_From });
      const allowedSet = new Set((rule.allowTranferTO || '').split(',').map((s) => s.trim()).filter(Boolean));
      const blockedSet = new Set((rule.blockTranferTO || '').split(',').map((s) => s.trim()).filter(Boolean));
      this.typeCodes.forEach((code) => {
        this.typeStates[code] = {
          allowed: allowedSet.has(code),
          blocked: blockedSet.has(code),
        };
      });
    } else {
      this.isEditMode = false;
      this.selectedId = undefined;
      this.ruleForm.reset();
    }
    this.showModal = true;
  }

  closeModal(): void {
    console.log('Closing modal');
    this.showModal = false;
    this.resetForm();
  }

  onSubmit(): void {
    if (this.ruleForm.valid) {
      const allowed = this.typeCodes.filter((code) => this.typeStates[code]?.allowed).join(',');
      const blocked = this.typeCodes.filter((code) => this.typeStates[code]?.blocked).join(',');
      const rule: StorageTypeRuleCreateDTO = {
        ewm_Code_StorageType_From: this.ruleForm.value.ewm_Code_StorageType_From,
        allowTranferTO: allowed,
        blockTranferTO: blocked,
      };
      console.log('Submitting rule:', rule, 'edit mode:', this.isEditMode, 'ID:', this.selectedId);
      if (this.isEditMode && this.selectedId) {
        this.apiService.updateStorageTypeRulee(this.selectedId, rule).subscribe({
          next: () => {
            console.log('Rule updated successfully');
            this.loadRules();
            this.closeModal();
          },
          error: (err) => {
            console.error('Error updating rule:', err);
          }
        });
      } else {
        this.apiService.createStorageTypeRulee(rule).subscribe({
          next: () => {
            console.log('Rule created successfully');
            this.loadRules();
            this.closeModal();
          },
          error: (err) => {
            console.error('Error creating rule:', err);
          }
        });
      }
    } else {
      console.warn('Form invalid, cannot submit');
    }
  }

  deleteRule(id: number): void {
    if (confirm('Are you sure you want to delete this rule?')) {
      console.log('Deleting rule with ID:', id);
      this.apiService.deleteStorageTypeRule(id).subscribe({
        next: () => {
          console.log('Rule deleted successfully');
          this.loadRules();
        },
        error: (err) => {
          console.error('Error deleting rule:', err);
        }
      });
    }
  }

  toggleAllowed(code: string, checked: boolean): void {
    if (!this.typeStates[code]) return;
    this.typeStates[code].allowed = checked;
    if (checked) this.typeStates[code].blocked = false;
    console.log('Toggled allowed for', code, ':', checked);
  }

  toggleBlocked(code: string, checked: boolean): void {
    if (!this.typeStates[code]) return;
    this.typeStates[code].blocked = checked;
    if (checked) this.typeStates[code].allowed = false;
    console.log('Toggled blocked for', code, ':', checked);
  }

  private resetTypeStates(): void {
    this.typeCodes.forEach((code) => {
      this.typeStates[code] = { allowed: false, blocked: false };
    });
    console.log('Reset type states');
  }

  private resetForm(): void {
    this.ruleForm.reset();
    this.isEditMode = false;
    this.selectedId = undefined;
    this.resetTypeStates();
    console.log('Reset form');
  }
}