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

  private static filterAppointmentOnStartTime(
    therapistID: string, startTime: Time, appointment: AppointmentSeries,
  ): AppointmentSeries | undefined {
    if (appointment.therapistID === therapistID && appointment.startTime === startTime) {
      return appointment;
    }
    return undefined;
  }

  private static filterAppointmentForDaylist(
    therapistID: string, startTime: Time, appointment: AppointmentSeries, date: Date, endTime?: Time,
  ): AppointmentSeries | undefined {
    if (appointment.therapistID === therapistID) {
      if (Dateconversions.appointmentIsInTimeInterval(appointment, startTime, endTime)) {
        if (this.appointmentIsInDayInterval(appointment, date)) {
          const readableStartDate = Dateconversions.convertDateToReadableString(appointment.startDate);
          const readableTargetDate = Dateconversions.convertDateToReadableString(date);
          if (
            (appointment.startDate <= date || readableStartDate === readableTargetDate)
          ) {
            return appointment;
          }
        }
      }
    }
    return undefined;
  }

  private static appointmentIsInDayInterval(appointment: AppointmentSeries, date: Date) : boolean {
    const currentDate = new Date(appointment.startDate);
    const tomorow = new Date(date.toDateString());
    tomorow.setDate(tomorow.getDate() + 1);

    let weekdayOffset = 1;
    switch (appointment.weekday) {
      case Weekday.MONDAY: weekdayOffset = 1; break;
      case Weekday.TUESDAY: weekdayOffset = 2; break;
      case Weekday.WEDNESDAY: weekdayOffset = 3; break;
      case Weekday.THURSDAY: weekdayOffset = 4; break;
      case Weekday.FRIDAY: weekdayOffset = 5; break;
      default: break;
    }

    const currentSearchDate = currentDate;
    // eslint-disable-next-line no-mixed-operators
    currentSearchDate.setDate(currentSearchDate.getDate() + ((7 - currentSearchDate.getDay()) % 7 + weekdayOffset) % 7);

    while (currentSearchDate < tomorow) {
      if (Dateconversions.convertDateToReadableString(currentSearchDate) === Dateconversions.convertDateToReadableString(date)) {
        return true;
      }
      currentSearchDate.setDate(currentDate.getDate() + (7 * appointment.interval));
    }
    return false;
  }

  searchAppointmentOnStartTime(therapistID: string, weekday: Weekday, startTime: Time): AppointmentSeries | undefined {
    const currentDay = this.findListday(weekday);
    if (currentDay !== undefined) {
      return currentDay.appointments.find(
        (appointment) => Masterlist.filterAppointmentOnStartTime(therapistID, startTime, appointment as AppointmentSeries),
      ) as AppointmentSeries;
    }
    return undefined;
  }

  searchAppointmentForDaylist(
    therapistID: string, weekday: Weekday, startTime: Time, date: Date, endTime?: Time,
  ): AppointmentSeries | undefined {
    const currentDay = this.findListday(weekday);
    if (currentDay !== undefined) {
      return currentDay.appointments.find(
        (appointment) => Masterlist.filterAppointmentForDaylist(therapistID, startTime, appointment as AppointmentSeries, date, endTime),
      ) as AppointmentSeries;
    }
    return undefined;
  }

  getAppointmentConflict(
    date: Date,
    therapistID: string,
    startTime: Time,
    endTime: Time,
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

    return this.searchAppointmentForDaylist(therapistID, weekday, startTime, date, endTime);
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
        (appointment) => (appointment.weekday === appointmentToBeChecked.weekday
          && appointment.startTime === appointmentToBeChecked.startTime && appointment.therapistID === appointmentToBeChecked.therapistID),
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
      (searchedAppointment) => searchedAppointment.id === appointment.id,
    );
    if (currentDay && appointmentToBeChanged) {
      appointmentToBeChanged.patient = appointment.patient;
      appointmentToBeChanged.startTime = appointment.startTime;
      const newAppointments = currentDay.appointments.filter(
        (filterAppointment) => filterAppointment.id !== appointment.id,
      );
      newAppointments.push(appointment);
      currentDay.appointments = newAppointments;
    }
  }

  deleteAppointment(appointment: AppointmentSeries): void {
    const currentDay = this.findListday(appointment.weekday);
    if (currentDay) {
      const newAppointments = currentDay.appointments.filter(
        (filterAppointment) => filterAppointment.id !== appointment.id,
      );
      currentDay.appointments = newAppointments;
    }
  }

  addCancellation(date : string, appointment : AppointmentSeries) : void {
    const currentDay = this.findListday(appointment.weekday);
    const appointmentToBeChanged = currentDay?.appointments.find(
      (searchedAppointment) => searchedAppointment.id === appointment.id,
    );
    if (currentDay && appointmentToBeChanged) {
      (appointmentToBeChanged as AppointmentSeries).cancellations.push(date);
      const newAppointments = currentDay.appointments.filter(
        (filterAppointment) => filterAppointment.id !== appointment.id,
      );
      newAppointments.push(appointment);
      currentDay.appointments = newAppointments;
    }
  }

  removeCancellation(date : string, appointment : AppointmentSeries) : void {
    const currentDay = this.findListday(appointment.weekday);
    const appointmentToBeChanged = currentDay?.appointments.find(
      (searchedAppointment) => searchedAppointment.id === appointment.id,
    );
    if (currentDay && appointmentToBeChanged) {
      (appointmentToBeChanged as AppointmentSeries)
        .cancellations = (appointmentToBeChanged as AppointmentSeries).cancellations.filter((c) => c !== date);
      const newAppointments = currentDay.appointments.filter(
        (filterAppointment) => filterAppointment.id !== appointment.id,
      );
      newAppointments.push(appointment);
      currentDay.appointments = newAppointments;
    }
  }

  private findListday(weekday: Weekday): ListWeekDay | undefined {
    return this.elements.find(
      (listday) => listday.weekday === weekday,
    );
  }
}
