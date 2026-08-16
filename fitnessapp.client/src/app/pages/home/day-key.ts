// Formats a Date's local calendar day as "yyyy-MM-dd", matching the backend's DateOnly JSON format.
export function dateOnlyKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Parses a "yyyy-MM-dd" string (as returned by the backend) into a local Date at midnight.
// `new Date("yyyy-MM-dd")` would instead parse it as UTC midnight, which can display as the
// wrong day once the DatePipe renders it back in the browser's local timezone.
export function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}
