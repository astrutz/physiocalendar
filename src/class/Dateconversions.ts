// eslint-disable-next-line import/no-cycle

import Appointment from './Appointment';
import { Time, Weekday } from './Enums';

export default class Dateconversions {
  static convertReadableStringToDate(readableDate: string): Date {
    const [day, month, year] = readableDate.split('.');
    return new Date(`${year}-${month}-${day}`);
  }

  static convertDateToReadableString(date: Date): string {
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
  }

  static timeFromString(timeString: string): Time {
    const [hour, minute] = timeString.split(':').map(Number);
    return Time[`${hour}:${minute}`];
  }

  static stringFromTime(time: Time): string {
    return time.toString();
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

  static getWeekdayForDate(date: Date) : Weekday | undefined {
    switch (date.getDay()) {
      case 1: return Weekday.MONDAY;
      case 2: return Weekday.TUESDAY;
      case 3: return Weekday.WEDNESDAY;
      case 4: return Weekday.THURSDAY;
      case 5: return Weekday.FRIDAY;
      case 6: return undefined;
      default: return Weekday.MONDAY;
    }
  }

  static getWeekdayStringForDate(date: Date) : string {
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

  static getAllTimes(): string[] {
    const times = [''];
    for (let i = 7; i < 21; i += 1) {
      const hour = i.toString();
      times.push(`${hour}:00`, `${hour}:10`, `${hour}:20`, `${hour}:30`, `${hour}:40`, `${hour}:50`);
    }
    return times;
  }

  static appointmentIsInTimeInterval(appointment: Appointment, startTime: Time, endTime?: Time) : boolean {
    if (endTime) {
      return Time[appointment.endTime] === Time[endTime]
      || Time[appointment.startTime] === Time[startTime]
      || (Time[appointment.startTime] < Time[startTime] && Time[appointment.endTime] > Time[endTime])
      || (Time[appointment.startTime] > Time[startTime] && Time[appointment.startTime] < Time[endTime])
      || (Time[appointment.endTime] > Time[startTime] && Time[appointment.endTime] < Time[endTime]);
    }
    return Time[appointment.startTime] === Time[startTime];
  }
}
