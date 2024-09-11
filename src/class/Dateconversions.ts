
import { Weekday } from './Enums';

export function formatDate(dateInput: string | Date | undefined): string {
  if (!dateInput) return '';
  // Stellen Sie sicher, dass dateInput ein Date-Objekt ist
  let date = dateInput;
  if (typeof dateInput === 'string') {
    date = new Date(dateInput);
  }
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    console.error('Invalid date provided:', dateInput);
    return ''; // oder Rückgabe eines Fehlertextes, falls gewünscht
  }
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}


export function formatTime(date: Date | undefined): string {
  if (!date) return '';
  return date.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function convertReadableStringToDate(readableDate: string): Date {
  const [day, month, year] = readableDate.split('.');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

export function convertDateToReadableString(date: Date): string {
  return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
}

export function convertEnglishToGermanReadableString(date: string): string {
  const [year, month, day] = date.split('-');
  return `${day}.${month}.${year}`;
}

export function convertGermanToEnglishReadableString(date: string): string {
  const [day, month, year] = date.split('.');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

export function datesAreEqual(date1: Date, date2: Date): boolean {
  return convertDateToReadableString(date1) === convertDateToReadableString(date2);
}

export function getWeekdayForDate(date: Date): Weekday | undefined {
  switch (date.getDay()) {
    case 0: return undefined;
    case 1: return Weekday.MONDAY;
    case 2: return Weekday.TUESDAY;
    case 3: return Weekday.WEDNESDAY;
    case 4: return Weekday.THURSDAY;
    case 5: return Weekday.FRIDAY;
    case 6: return undefined;
    default: return undefined;
  }
}

export function getGermanWeekdayString(weekday: Weekday): string {
  switch (weekday) {
    case Weekday.MONDAY: return 'Montag';
    case Weekday.TUESDAY: return 'Dienstag';
    case Weekday.WEDNESDAY: return 'Mittwoch';
    case Weekday.THURSDAY: return 'Donnerstag';
    case Weekday.FRIDAY: return 'Freitag';
    default: return '';
  }
}

export function getWeekdayStringForDate(date: Date) : string {
  switch (date.getDay()) {
    case 1: return 'Mo,';
    case 2: return 'Di,';
    case 3: return 'Mi,';
    case 4: return 'Do,';
    case 5: return 'Fr,';
    case 6: return 'Sa,';
    default: return '';
  }
}

export function getAllTimes(): string[] {
  const times: string[] = [];
  for (let i = 7; i < 21; i += 1) {
    const hour = i.toString();
    times.push(`${hour}:00`, `${hour}:10`, `${hour}:20`, `${hour}:30`, `${hour}:40`, `${hour}:50`);
  }
  return times;
}

// Beispielhafte Nutzung der composable Funktionen in einer Vue-Komponente mit TypeScript.
