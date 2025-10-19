import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular'; // v6 wrapper
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarOptions, EventInput, EventApi, DateSelectArg, EventClickArg } from '@fullcalendar/core'; // FIXED: Import from core, use EventInput for events, EventApi for runtime

@Component({
  selector: 'app-calender',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  template: `
    <full-calendar [options]="calendarOptions"></full-calendar>
    <!-- Add your modal or event details UI here if needed -->
  `,
  styles: [`
    /* Your component-specific styles, e.g., for event rendering */
  `]
})
export class CalenderComponent implements OnInit {
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    initialView: 'dayGridMonth',
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    weekends: true,
    // FIXED: Use EventInput[] type, add 'id' as string (required for v6 uniqueness)
    events: [
      { id: '1', title: 'All Day Event', date: '2025-10-14' }, // FIXED: EventInput with id
      { id: '2', title: 'Long Event', date: '2025-10-15' },   // FIXED
      { id: '3', title: 'Repeating Event', daysOfWeek: [2, 4], startRecur: '2025-10-16' } // FIXED
    ] as EventInput[],
    // FIXED: Explicit types for params to avoid implicit 'any'
    select: (info: DateSelectArg) => this.handleDateSelect(info),
    eventClick: (info: EventClickArg) => this.handleEventClick(info),
    // FIXED: Explicit type for eventContent
    eventContent: (arg: { event: EventApi }) => this.renderEventContent(arg)
  };

  selectedEvent: EventApi | null = null; // FIXED: Use EventApi for runtime event with id

  ngOnInit(): void {
    // Optional: Load events dynamically
  }

  // FIXED: Typed param, use EventApi for id access
  private handleDateSelect(selectInfo: DateSelectArg): void {
    const title = prompt('Please enter a new event title:');
    const calendarApi = selectInfo.view.calendar;

    if (title) {
      // FIXED: Use EventInput with generated id
      calendarApi.addEvent({
        id: Date.now().toString(), // FIXED: String id for uniqueness
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay
      } as EventInput);
    }

    calendarApi.unselect();
  }

  // FIXED: Typed param, access id via EventApi
  private handleEventClick(clickInfo: EventClickArg): void {
    this.selectedEvent = clickInfo.event; // FIXED: EventApi has id

    if (confirm(`Are you sure you want to delete "${clickInfo.event.title}"?`)) {
      clickInfo.event.remove();
    }
  }

  // FIXED: Typed arg, access id via event
  private renderEventContent(arg: { event: EventApi }): HTMLElement {
    const event = arg.event;
    const el = document.createElement('div');
    el.innerHTML = `
      <div class="event-content">
        <strong>${event.title}</strong>
        <p>ID: ${event.id}</p> <!-- FIXED: Access via EventApi -->
      </div>
    `;
    return el;
  }
}