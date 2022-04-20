// eslint-disable-next-line import/no-cycle
import Dateconversions from './Dateconversions';
import { Time, Weekday } from './Enums';
import ListSingleDay from './ListSingleDay';
import SingleAppointment from './SingleAppointment';

export default class Daylist {
  elements: ListSingleDay[];

  constructor(
    elements: ListSingleDay[],
  ) {
    this.elements = elements;
  }

  searchAppointment(therapist: string, dateString: string, time: Time): SingleAppointment | undefined {
    const currentDay = this.findListday(dateString);
    if (currentDay !== undefined) {
      return currentDay.appointments.find(
        (appointment) => appointment.therapist === therapist && appointment.time === time,
      ) as SingleAppointment;
    }
    return undefined;
  }

  searchAppointmentString(therapist: string, dateString: string, time: Time): string {
    const currentDay = this.findListday(dateString);
    if (currentDay !== undefined) {
      const foundAppointment = currentDay.appointments.find(
        (appointment) => appointment.therapist === therapist && appointment.time === time,
      );
      return foundAppointment?.patient || '';
    }
    return '';
  }

  getAppointmentConflicts(
    weekday: Weekday,
    hasEnd: boolean,
    therapist: string,
    endDate: Date | null,
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
    if (hasEnd && endDate) {
      currentEndDate = endDate;
    } else {
      currentEndDate.setFullYear(currentEndDate.getFullYear() + 1);
    }

    while (currentSearchDate < currentEndDate) {
      const conflictAppointment = this.searchAppointment(
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

  addAppointment(appointment: SingleAppointment): void {
    const currentDay = this.findListday(appointment.date);
    if (currentDay === undefined) {
      this.elements.push(new ListSingleDay([appointment], appointment.date));
    } else {
      currentDay.appointments.push(appointment);
    }
  }

  changeAppointment(appointment: SingleAppointment): void {
    const currentDay = this.findListday(appointment.date);
    const appointmentToBeChanged = currentDay?.appointments.find(
      (searchedAppointment) => searchedAppointment.therapist === appointment.therapist
        && searchedAppointment.time === appointment.time,
    );
    if (currentDay && appointmentToBeChanged) {
      appointmentToBeChanged.patient = appointment.patient;
      const newAppointments = currentDay.appointments.filter(
        (filterAppointment) => !(filterAppointment.therapist === appointment.therapist
          && filterAppointment.time === appointment.time),
      );
      newAppointments.push(appointment);
      currentDay.appointments = newAppointments;
    }
  }

  deleteAppointment(appointment: SingleAppointment): void {
    const currentDay = this.findListday(appointment.date);
    if (currentDay) {
      const newAppointments = currentDay.appointments.filter(
        (filterAppointment) => !(filterAppointment.therapist === appointment.therapist
          && filterAppointment.time === appointment.time),
      );
      currentDay.appointments = newAppointments;
    }
  }

  private findListday(date: string | Date): ListSingleDay | undefined {
    let dateConverted: Date;
    if (typeof date === 'string') {
      dateConverted = Dateconversions.convertReadableStringToDate(date);
    } else {
      dateConverted = date;
    }
    return this.elements.find(
      (listday) => Dateconversions.datesAreEqual(listday.date, dateConverted),
    );
  }
}
