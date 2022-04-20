import AppointmentRequest from './AppointmentRequest';
import AppointmentSeries from './AppointmentSeries';
import Daylist from './Daylist';
import { Time, Weekday } from './Enums';
import Masterlist from './Masterlist';

export default class AppointmentFinder {
  patient: string;

  therapists: string[];

  appointmentRequests: AppointmentRequest[];

  masterlist: Masterlist;

  daylist: Daylist;

  static timeMapping = AppointmentRequest.timesOfDayToTimes();

  // TODO: Is this enough or too much? Maybe generate automatically, depending on therapists and times of day
  // Example: 30 Slots max. should be shown on Finder - 5 Requests on 2 therapists selected means, that this number should be 30 / 5 / 2 = 3
  // Alternative: Use pagination - but shouldn't be used, since we don't need so many appointments
  static MAX_APPOINTMENTS_PER_TIMEOFDAY_PER_THERAPIST = 3;

  constructor(
    patient: string,
    therapists: string[],
    appointmentRequests: AppointmentRequest[],
    masterlist: Masterlist,
    daylist: Daylist,
  ) {
    this.patient = patient;
    this.therapists = therapists;
    this.appointmentRequests = appointmentRequests;
    this.masterlist = masterlist;
    this.daylist = daylist;
  }

  getSuggestions(): AppointmentSeries[] {
    let suggestions: AppointmentSeries[] = [];
    this.therapists.forEach((therapist) => {
      this.appointmentRequests.forEach((request) => {
        suggestions = suggestions.concat(
          this.getAppointmentForTherapistinRequest(therapist, AppointmentFinder.timeMapping[request.timeOfDay], request.weekday),
        );
      });
    });
    return suggestions;
  }

  getAppointmentForTherapistinRequest(therapist: string, times: string[], weekday: Weekday): AppointmentSeries[] {
    let foundCounter = 0;
    const foundAppointments: AppointmentSeries[] = [];
    times.every((time) => {
      if (foundCounter === AppointmentFinder.MAX_APPOINTMENTS_PER_TIMEOFDAY_PER_THERAPIST) {
        return false;
      }
      const foundAppointment = this.masterlist.searchAppointment(therapist, weekday, time as unknown as Time);
      if (foundAppointment === undefined) {
        // TODO: take endDate when available
        const conflicts = this.daylist.getAppointmentConflicts(
          weekday,
          false,
          therapist,
          null,
          time as unknown as Time,
        );
        if (conflicts.length === 0) {
          foundCounter += 1;
          foundAppointments.push(new AppointmentSeries(therapist, this.patient, time as unknown as Time, weekday, false));
        }
      }
      return true;
    });
    return foundAppointments;
  }
}
