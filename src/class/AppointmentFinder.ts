import AppointmentRequest from './AppointmentRequest';
import AppointmentSeries from './AppointmentSeries';
import Daylist from './Daylist';
import { Time, Weekday } from './Enums';
import Masterlist from './Masterlist';

export default class AppointmentFinder {
  patient: string;

  therapists: string[];

  therapistIDs: string[];

  appointmentRequests: AppointmentRequest[];

  hasEnd: boolean;

  endDate: Date | null;

  masterlist: Masterlist;

  daylist: Daylist;

  MAX_APPOINTMENTS_PER_TIMEOFDAY_PER_THERAPIST;

  static MAX_APPOINTMENTS_TOTAL = 30;

  static timeMapping = AppointmentRequest.timesOfDayToTimes();

  constructor(
    patient: string,
    therapists: string[],
    therapistIDs: string[],
    appointmentRequests: AppointmentRequest[],
    hasEnd: boolean,
    endDate: Date | null,
    masterlist: Masterlist,
    daylist: Daylist,
  ) {
    this.patient = patient;
    this.therapists = therapists;
    this.therapistIDs = therapistIDs;
    this.appointmentRequests = appointmentRequests;
    this.hasEnd = hasEnd;
    this.endDate = endDate;
    this.masterlist = masterlist;
    this.daylist = daylist;
    const appointmentPerPersonPerSlot = Math.ceil(
      AppointmentFinder.MAX_APPOINTMENTS_TOTAL / appointmentRequests.length / this.therapists.length,
    );
    this.MAX_APPOINTMENTS_PER_TIMEOFDAY_PER_THERAPIST = appointmentPerPersonPerSlot;
  }

  getSuggestions(): AppointmentSeries[] {
    let suggestions: AppointmentSeries[] = [];
    this.therapists.forEach((therapistIDs, i) => {
      this.appointmentRequests.forEach((request) => {
        suggestions = suggestions.concat(
          this.getAppointmentForTherapistinRequest(
            this.therapists[i], therapistIDs, AppointmentFinder.timeMapping[request.timeOfDay], request.weekday,
          ),
        );
      });
    });
    return suggestions.slice(0, AppointmentFinder.MAX_APPOINTMENTS_TOTAL);
  }

  private getAppointmentForTherapistinRequest(
    therapist: string, therapistID: string, times: string[], weekday: Weekday,
  ): AppointmentSeries[] {
    let foundCounter = 0;
    const foundAppointments: AppointmentSeries[] = [];
    times.every((time) => {
      if (foundCounter === this.MAX_APPOINTMENTS_PER_TIMEOFDAY_PER_THERAPIST) {
        return false;
      }
      const foundAppointment = this.masterlist.searchAppointment(therapistID, weekday, time as unknown as Time);
      if (foundAppointment === undefined) {
        const conflicts = this.daylist.getAppointmentConflicts(
          weekday,
          therapistID,
          time as unknown as Time,
          new Date(), // TODO: Fix me when changing appointment finder
        );
        if (conflicts.length === 0) {
          foundCounter += 1;
          foundAppointments.push(
            new AppointmentSeries(therapist, therapistID, this.patient, time as unknown as Time, weekday, undefined, false),
          );
        }
      }
      return true;
    });
    return foundAppointments;
  }
}
