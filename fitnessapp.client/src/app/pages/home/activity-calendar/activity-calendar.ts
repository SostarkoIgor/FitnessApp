import { Component, computed, input } from '@angular/core';

import { dateOnlyKey } from '../day-key';

const DAYS_BACK = 29;
const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface CalendarCell {
  key: string;
  dayNum: number;
  inRange: boolean;
  active: boolean;
  isToday: boolean;
}

@Component({
  selector: 'app-activity-calendar',
  standalone: false,
  templateUrl: './activity-calendar.html',
  styleUrl: './activity-calendar.css',
})
export class ActivityCalendar {
  readonly activeDayKeys = input<string[]>([]);

  protected readonly weekdayLabels = WEEKDAY_LABELS;

  protected readonly calendarCells = computed<CalendarCell[]>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const rangeStart = new Date(today);
    rangeStart.setDate(rangeStart.getDate() - DAYS_BACK);

    const gridStart = new Date(rangeStart);
    gridStart.setDate(gridStart.getDate() - gridStart.getDay());

    const gridEnd = new Date(today);
    gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()));

    const activeDays = new Set(this.activeDayKeys());

    const cells: CalendarCell[] = [];
    const cursor = new Date(gridStart);
    while (cursor <= gridEnd) {
      const inRange = cursor >= rangeStart && cursor <= today;
      const key = dateOnlyKey(cursor);
      cells.push({
        key,
        dayNum: cursor.getDate(),
        inRange,
        active: inRange && activeDays.has(key),
        isToday: key === dateOnlyKey(today),
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    return cells;
  });

  protected readonly activeDayCount = computed(
    () => this.calendarCells().filter((cell) => cell.active).length,
  );
}
