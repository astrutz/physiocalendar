// eslint-disable-next-line import/no-cycle

import { Weekday } from './Enums';

export default class Dateconversions {
  static convertReadableStringToDate(readableDate: string): Date {
    const [day, month, year] = readableDate.split('.');
    return new Date(`${year}-${month}-${day}`);
  }

  static convertDateToReadableString(date: Date): string {
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
  }

  static convertEnglishToGermanReadableString(date: string): string {
    const [year, month, day] = date.split('-');
    return `${day}.${month}.${year}`;
  }

  static convertGermanToEnglishReadableString(date: string): string {
    const [day, month, year] = date.split('.');
    return `${year}-${month}-${day}`;
  }

  static datesAreEqual(date1: Date, date2: Date): boolean {
    return this.convertDateToReadableString(date1) === this.convertDateToReadableString(date2);
  }

  static getWeekdayForDate(date: Date) : Weekday {
    switch (date.getDay()) {
      case 1: return Weekday.MONDAY;
      case 2: return Weekday.TUESDAY;
      case 3: return Weekday.WEDNESDAY;
      case 4: return Weekday.THURSDAY;
      case 5: return Weekday.FRIDAY;
      default: return Weekday.MONDAY;
    }
  }
}
