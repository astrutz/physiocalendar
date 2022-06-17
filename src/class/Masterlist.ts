import Appointment from './Appointment';
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
      return appointment;
    }
    return undefined;
  }

  private static filterAppointmentForDaylist(
    therapistID: string, time: Time, appointment: AppointmentSeries, date: Date,
  ): AppointmentSeries | undefined {
    if (appointment.therapistID === therapistID && appointment.time === time) {
      const readableStartDate = Dateconversions.convertDateToReadableString(appointment.startDate);
      const readableTargetDate = Dateconversions.convertDateToReadableString(date);
      if (
        (appointment.startDate <= date || readableStartDate === readableTargetDate)
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

  getAppointmentConflict(
    date: Date,
    therapistID: string,
    time: Time,
  ): AppointmentSeries | undefined {
    const dateWeekday = date.getDay();
    let weekday : Weekday = Weekday.FRIDAY;

    switch (dateWeekday) {
      case 1: weekday = Weekday.MONDAY; break;
      case 2: weekday = Weekday.TUESDAY; break;
      case 3: weekday = Weekday.WEDNESDAY; break;
      case 4: weekday = Weekday.THURSDAY; break;
      case 5: weekday = Weekday.FRIDAY; break;
      default: break;
    }

    return this.searchAppointmentForDaylist(therapistID, weekday, time, date);
  }

  getAppointmentSeriesByPatient(patient: string): AppointmentSeries[] {
    let appointments: Appointment[] = [];
    const monday = this.findListday(Weekday.MONDAY);
    if (monday) {
      appointments = appointments.concat(monday.appointments.filter((appointment) => appointment.patient === patient));
    }
    const tuesday = this.findListday(Weekday.TUESDAY);
    if (tuesday) {
      appointments = appointments.concat(tuesday.appointments.filter((appointment) => appointment.patient === patient));
    }
    const wednesday = this.findListday(Weekday.WEDNESDAY);
    if (wednesday) {
      appointments = appointments.concat(wednesday.appointments.filter((appointment) => appointment.patient === patient));
    }
    const thursday = this.findListday(Weekday.THURSDAY);
    if (thursday) {
      appointments = appointments.concat(thursday.appointments.filter((appointment) => appointment.patient === patient));
    }
    const friday = this.findListday(Weekday.FRIDAY);
    if (friday) {
      appointments = appointments.concat(friday.appointments.filter((appointment) => appointment.patient === patient));
    }
    return Masterlist.removeDuplicates(appointments as AppointmentSeries[]);
  }

  private static removeDuplicates(appointmentList: AppointmentSeries[]): AppointmentSeries[] {
    const newAppointments: AppointmentSeries[] = [];
    appointmentList.forEach((appointmentToBeChecked) => {
      if (!newAppointments.find(
        (appointment) => (appointment.weekday === appointmentToBeChecked.weekday && appointment.time === appointmentToBeChecked.time
          && appointment.therapistID === appointmentToBeChecked.therapistID),
      )) {
        newAppointments.push(appointmentToBeChecked);
      }
    });
    return newAppointments;
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
