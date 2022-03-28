import AppointmentSeries from './AppointmentSeries';
import Dateconversions from './Dateconversions';
import { Time, Weekday } from './Enums';
import ListWeekDay from './ListWeekDay';

export default class Masterlist {
  elements: ListWeekDay[];

  constructor(
    elements: ListWeekDay[],
  ) {
    this.elements = elements;
  }

  private static filterAppointment(therapist: string, time: Time, appointment: AppointmentSeries): AppointmentSeries | undefined {
    if (appointment.therapist === therapist && appointment.time === time) {
      if (appointment.hasEnd || appointment.endDate === null) {
        return appointment;
      }
      const readableStartDate = Dateconversions.convertDateToReadableString(appointment.startDate);
      const readableEndDate = Dateconversions.convertDateToReadableString(appointment.endDate);
      const readableNow = Dateconversions.convertDateToReadableString(new Date());
      if (
        (appointment.startDate <= new Date()
          || readableStartDate === readableNow) && (appointment.endDate >= new Date()
            || readableEndDate === readableNow)
      ) {
        return appointment;
      }
      return appointment;
    }
    return undefined;
  }

  searchAppointment(therapist: string, weekday: Weekday, time: Time): AppointmentSeries | undefined {
    const currentDay = this.findListday(weekday);
    if (currentDay !== undefined) {
      return currentDay.appointments.find(
        (appointment) => Masterlist.filterAppointment(therapist, time, appointment as AppointmentSeries),
      ) as AppointmentSeries;
    }
    return undefined;
  }

  searchAppointmentString(therapist: string, weekday: Weekday, time: Time): string {
    const currentDay = this.findListday(weekday);
    if (currentDay !== undefined) {
      const foundAppointment = currentDay.appointments.find(
        (appointment) => Masterlist.filterAppointment(therapist, time, appointment as AppointmentSeries),
      ) as AppointmentSeries;
      return foundAppointment?.patient || '';
    }
    return '';
  }

  addAppointment(appointment: AppointmentSeries): void {
    const currentDay = this.findListday(appointment.weekday);
    if (currentDay === undefined) {
      this.elements.push(new ListWeekDay([appointment], appointment.weekday));
    } else {
      currentDay.appointments.push(appointment);
    }
  }

  changeAppointment(appointment: AppointmentSeries): void {
    const currentDay = this.findListday(appointment.weekday);
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

  deleteAppointment(appointment: AppointmentSeries): void {
    const currentDay = this.findListday(appointment.weekday);
    if (currentDay) {
      const newAppointments = currentDay.appointments.filter(
        (filterAppointment) => !(filterAppointment.therapist === appointment.therapist
          && filterAppointment.time === appointment.time),
      );
      currentDay.appointments = newAppointments;
    }
  }

  private findListday(weekday: Weekday): ListWeekDay | undefined {
    return this.elements.find(
      (listday) => listday.weekday === weekday,
    );
  }
}
