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

  private static filterAppointment(
    therapistID: string, time: Time, appointment: AppointmentSeries,
  ): AppointmentSeries | undefined {
    if (appointment.therapistID === therapistID && appointment.time === time) {
      if (appointment.hasEnd === false || appointment.endDate === null) {
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
    }
    return undefined;
  }

  private static filterAppointmentForDaylist(
    therapistID: string, time: Time, appointment: AppointmentSeries, date: Date,
  ): AppointmentSeries | undefined {
    if (appointment.therapistID === therapistID && appointment.time === time) {
      if (appointment.hasEnd === false || appointment.endDate === null) {
        return appointment;
      }
      const readableStartDate = Dateconversions.convertDateToReadableString(appointment.startDate);
      const readableEndDate = Dateconversions.convertDateToReadableString(appointment.endDate);
      const readableTargetDate = Dateconversions.convertDateToReadableString(date);
      if (
        (appointment.startDate <= date
          || readableStartDate === readableTargetDate) && (appointment.endDate >= date
            || readableEndDate === readableTargetDate)
      ) {
        return appointment;
      }
    }
    return undefined;
  }

  searchAppointment(therapistID: string, weekday: Weekday, time: Time): AppointmentSeries | undefined {
    const currentDay = this.findListday(weekday);
    if (currentDay !== undefined) {
      return currentDay.appointments.find(
        (appointment) => Masterlist.filterAppointment(therapistID, time, appointment as AppointmentSeries),
      ) as AppointmentSeries;
    }
    return undefined;
  }

  searchAppointmentString(therapistID: string, weekday: Weekday, time: Time): string {
    const currentDay = this.findListday(weekday);
    if (currentDay !== undefined) {
      const foundAppointment = currentDay.appointments.find(
        (appointment) => Masterlist.filterAppointment(therapistID, time, appointment as AppointmentSeries),
      ) as AppointmentSeries;
      return foundAppointment?.patient || '';
    }
    return '';
  }

  searchAppointmentStringForDaylist(therapistID: string, weekday: Weekday, time: Time, date: Date): string {
    const currentDay = this.findListday(weekday);
    if (currentDay !== undefined) {
      const foundAppointment = currentDay.appointments.find(
        (appointment) => Masterlist.filterAppointmentForDaylist(therapistID, time, appointment as AppointmentSeries, date),
      ) as AppointmentSeries;
      return foundAppointment?.patient || '';
    }
    return '';
  }

  searchAppointmentForDaylist(therapistID: string, weekday: Weekday, time: Time, date: Date): AppointmentSeries | undefined {
    const currentDay = this.findListday(weekday);
    if (currentDay !== undefined) {
      return currentDay.appointments.find(
        (appointment) => Masterlist.filterAppointmentForDaylist(therapistID, time, appointment as AppointmentSeries, date),
      ) as AppointmentSeries;
    }
    return undefined;
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
      (searchedAppointment) => searchedAppointment.therapistID === appointment.therapistID
        && searchedAppointment.time === appointment.time,
    );
    if (currentDay && appointmentToBeChanged) {
      appointmentToBeChanged.patient = appointment.patient;
      const newAppointments = currentDay.appointments.filter(
        (filterAppointment) => !(filterAppointment.therapistID === appointment.therapistID
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
        (filterAppointment) => !(filterAppointment.therapistID === appointment.therapistID
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
