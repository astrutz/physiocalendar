import Dateconversions from './Dateconversions';
import { Time } from './Enums';
import ListSingleDay from './ListSingleDay';

export default class Daylist {
  elements: ListSingleDay[];

  constructor(
    elements: ListSingleDay[],
  ) {
    this.elements = elements;
  }

  searchAppointment(therapist: string, date: string, time: Time): string {
    const currentDay = this.elements.find(
      (listday) => Dateconversions.datesAreEqual(listday.date, Dateconversions.convertReadableStringToDate(date)),
    );
    if (currentDay !== undefined) {
      const foundAppointment = currentDay.appointments.find(
        (appointment) => appointment.therapist === therapist && appointment.time === time,
      );
      return foundAppointment?.patient || '';
    }
    return '';
  }
}
