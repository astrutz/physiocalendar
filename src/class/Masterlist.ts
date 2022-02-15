import { Time, Weekday } from './Enums';
import ListWeekDay from './ListWeekDay';

export default class Masterlist {
  elements: ListWeekDay[];

  constructor(
    elements: ListWeekDay[],
  ) {
    this.elements = elements;
  }

  searchAppointment(therapist: string, weekday: Weekday, time: Time): string {
    const currentDay = this.findListday(weekday);
    if (currentDay !== undefined) {
      const foundAppointment = currentDay.appointments.find(
        (appointment) => appointment.therapist === therapist && appointment.time === time,
      );
      return foundAppointment?.patient || '';
    }
    return '';
  }

  private findListday(weekday: Weekday): ListWeekDay | undefined {
    return this.elements.find(
      (listday) => listday.weekday === weekday,
    );
  }
}
