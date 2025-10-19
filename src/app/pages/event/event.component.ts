// src/app/pages/event/event.component.ts
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service';
import { EventDto, CreateEventDto, UpdateEventDto, EventType } from '../../models/event.model';
import { ControlModelDto } from '../../models/control-model.model';
import { CharacteristicDto } from '../../models/characteristic.model';
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
  selector: 'app-event',
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
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css'],
  providers: [MessageService, ConfirmationService]
})
export class EventComponent {
  events = signal<EventDto[]>([]);
  selectedEvent = signal<EventDto | null>(null);
  eventForm: FormGroup;
  displayFormDialog = signal<boolean>(false);
  displayCharacteristicDialog = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  isAddMode = signal<boolean>(true);
  selectedCharacteristicId = signal<number>(0);

  allControlModels = signal<ControlModelDto[]>([]);
  characteristicsForAdd = signal<Option[]>([]);
  characteristicsForRemove = signal<Option[]>([]);

  eventTypeOptions = [
    { label: 'Shift Start', value: EventType.SHIFT_START },
    { label: 'Shift End', value: EventType.SHIFT_END },
    { label: 'Characteristic Event', value: EventType.CHARACTERISTIC_EVENT },
    { label: 'Production Start', value: EventType.PRODUCTION_START },
    { label: 'Production End', value: EventType.PRODUCTION_END }
  ];

  private apiService = inject(ApiService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);

  constructor() {
    this.eventForm = this.fb.group({
      name: ['', Validators.required],
      eventType: [EventType.SHIFT_START, Validators.required],
      eventDate: [new Date().toISOString().split('T')[0], Validators.required],
      controlModelId: [0, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadEvents();
    this.loadControlModels();
  }

  loadEvents(): void {
    this.apiService.getAllEvents().subscribe({
      next: (data: EventDto[]) => this.events.set(data),
      error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load events: ' + err.message })
    });
  }

  loadControlModels(): void {
    this.apiService.getControlModels().subscribe({
      next: (data: ControlModelDto[]) => this.allControlModels.set(data),
      error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load control models: ' + err.message })
    });
  }

  openCreateDialog(): void {
    this.isEditMode.set(false);
    this.eventForm.reset({ 
      eventType: EventType.SHIFT_START, 
      eventDate: new Date().toISOString().split('T')[0],
      controlModelId: 0 
    });
    this.displayFormDialog.set(true);
  }

  openEditDialog(event: EventDto): void {
    this.selectedEvent.set(event);
    this.isEditMode.set(true);
    this.eventForm.patchValue({
      name: event.name,
      eventType: event.eventType,
      eventDate: new Date(event.eventDate).toISOString().split('T')[0],
      controlModelId: event.controlModelId
    });
    this.displayFormDialog.set(true);
  }

  saveEvent(): void {
    if (this.eventForm.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please fill all required fields' });
      return;
    }

    const formValue = this.eventForm.value;
    formValue.eventDate = new Date(formValue.eventDate);
     if (formValue.eventType && typeof formValue.eventType === 'string') {
    formValue.eventType = Number(formValue.eventType);
  }

    if (this.isEditMode()) {
      const dto: UpdateEventDto = formValue;  // No id in dto
      this.apiService.updateEvent(this.selectedEvent()!.id, dto).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Event updated' });
          this.loadEvents();
          this.displayFormDialog.set(false);
        },
        error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update: ' + (err.error?.message || err.message) })
      });
    } else {
      const dto: CreateEventDto = formValue;
      this.apiService.createEvent(dto).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Event created' });
          this.loadEvents();
          this.displayFormDialog.set(false);
        },
        error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create: ' + (err.error?.message || err.message) })
      });
    }
  }

  deleteEvent(event: EventDto): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this event?',
      accept: () => {
        this.apiService.deleteEvent(event.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Event deleted' });
            this.loadEvents();
          },
          error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete: ' + (err.error?.message || err.message) })
        });
      }
    });
  }

  openCharacteristicDialog(event: EventDto, isAdd: boolean): void {
    this.selectedEvent.set(event);
    this.isAddMode.set(isAdd);
    this.selectedCharacteristicId.set(0);

    const controlModel = this.allControlModels().find(cm => cm.id === event.controlModelId);
    if (!controlModel || !controlModel.characteristics) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'No control model or characteristics found' });
      return;
    }

    const assignedIds = new Set(event.characteristics?.map(c => c.id) || []);

    if (isAdd) {
      const available = controlModel.characteristics
        .filter(c => c.id !== undefined && !assignedIds.has(c.id))
        .map(c => ({ label: `${c.characteristicName} (ID: ${c.id})`, value: c.id! }));
      this.characteristicsForAdd.set(available);
    } else {
      const assigned = event.characteristics?.filter(c => c.id !== undefined).map(c => ({ label: `${c.characteristicName} (ID: ${c.id})`, value: c.id! })) || [];
      this.characteristicsForRemove.set(assigned);
    }

    this.displayCharacteristicDialog.set(true);
  }

  manageCharacteristic(): void {
    if (!this.selectedEvent() || !this.selectedCharacteristicId()) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please select a characteristic' });
      return;
    }

    const charId = this.selectedCharacteristicId();
    const eventId = this.selectedEvent()!.id;

    if (this.isAddMode()) {
      this.apiService.addCharacteristicToEvent(eventId, charId).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Characteristic added' });
          this.loadEvents();
          this.displayCharacteristicDialog.set(false);
        },
        error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to add: ' + (err.error?.message || err.message) })
      });
    } else {
      this.apiService.removeCharacteristicFromEvent(eventId, charId).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Characteristic removed' });
          this.loadEvents();
          this.displayCharacteristicDialog.set(false);
        },
        error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to remove: ' + (err.error?.message || err.message) })
      });
    }
  }

  getControlModelLabel(controlModelId: number): string {
    return this.allControlModels().find(cm => cm.id === controlModelId)?.description || 'Unknown';
  }

  getEventTypeLabel(eventType: EventType): string {
    console.log('EventType value:', eventType);  // Log to check if number and matches options
    return this.eventTypeOptions.find(opt => opt.value === eventType)?.label || 'Unknown';
  }
}