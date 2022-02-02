import Dateconversions from './Dateconversions';
import { Time } from './Enums';
import ListSingleDay from './ListSingleDay';
import SingleAppointment from './SingleAppointment';

export default class Daylist {
  elements: ListSingleDay[];

  constructor(
    elements: ListSingleDay[],
  ) {
    this.elements = elements;
  }

  searchAppointment(therapist: string, dateString: string, time: Time): string {
    const currentDay = this.findListday(dateString);
    if (currentDay !== undefined) {
      const foundAppointment = currentDay.appointments.find(
        (appointment) => appointment.therapist === therapist && appointment.time === time,
      );
      return foundAppointment?.patient || '';
    }
    return '';
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
