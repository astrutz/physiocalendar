// eslint-disable-next-line import/no-cycle
import Daylist from './Daylist';
import { Time, Weekday } from './Enums';
import SingleAppointment from './SingleAppointment';

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

  static checkAppointmentConflicts(
    daylist: Daylist,
    weekday: Weekday,
    hasEnd: boolean,
    therapist: string,
    endDate : Date,
    time: Time,
  ): SingleAppointment[] {
    const conflicts: SingleAppointment[] = [];
    let weekdayOffset = 1;

    switch (weekday) {
      case Weekday.MONDAY: weekdayOffset = 1; break;
      case Weekday.TUESDAY: weekdayOffset = 2; break;
      case Weekday.WEDNESDAY: weekdayOffset = 3; break;
      case Weekday.THURSDAY: weekdayOffset = 4; break;
      case Weekday.FRIDAY: weekdayOffset = 5; break;
      default: break;
    }

    const currentSearchDate = new Date();
    // eslint-disable-next-line no-mixed-operators
    currentSearchDate.setDate(currentSearchDate.getDate() + ((7 - currentSearchDate.getDay()) % 7 + weekdayOffset) % 7);

    let currentEndDate = new Date();
    if (hasEnd) {
      currentEndDate = endDate;
    } else {
      currentEndDate.setFullYear(currentEndDate.getFullYear() + 1);
    }

    while (currentSearchDate < currentEndDate) {
      const conflictAppointment = daylist.searchAppointment(
        therapist,
        Dateconversions.convertDateToReadableString(currentSearchDate),
        time,
      );
      if (conflictAppointment) {
        conflicts.push(conflictAppointment);
      }
      currentSearchDate.setDate(currentSearchDate.getDate() + 7);
    }
    // console.log('check', new Date().toLocaleDateString(), '-', currentEndDate.toLocaleDateString(), conflicts.length, 'conflicts found');
    return conflicts;
  }
}
