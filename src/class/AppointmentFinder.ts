import holidaysJSON from '@/data/holidays.json';
import AppointmentRequest from './AppointmentRequest';
import Dateconversions from './Dateconversions';
import Daylist from './Daylist';
import { nextTime, Time, Weekday } from './Enums';
import Masterlist from './Masterlist';
import SingleAppointment from './SingleAppointment';
import Therapist from './Therapist';

export default class AppointmentFinder {
  patient: string;

  therapists: string[];

  therapistIDs: string[];

  appointmentsNeeded: number;

  appointmentLength: number;

  appointmentRequests: AppointmentRequest[];

  daylist: Daylist;

  masterlist: Masterlist;

  allTherapists: Therapist[];

  MAX_APPOINTMENTS_PER_TIMEOFDAY_PER_THERAPIST;

  MAX_APPOINTMENTS_TOTAL: number;

  static APPOINTMENTS_PER_WEEK = 3;

  static timeMapping = AppointmentRequest.timesOfDayToTimes();

  constructor(
    patient: string,
    therapists: string[],
    therapistIDs: string[],
    appointmentsNeeded: number,
    appointmentLength: number,
    appointmentRequests: AppointmentRequest[],
    daylist: Daylist,
    masterlist: Masterlist,
    allTherapists: Therapist[],
  ) {
    this.patient = patient;
    this.therapists = therapists;
    this.therapistIDs = therapistIDs;
    this.appointmentsNeeded = parseInt(appointmentsNeeded.toString(), 10);
    this.appointmentLength = appointmentLength;
    this.appointmentRequests = appointmentRequests;
    this.daylist = daylist;
    this.masterlist = masterlist;
    this.allTherapists = allTherapists;
    this.MAX_APPOINTMENTS_TOTAL = appointmentsNeeded > 10 ? Math.min(appointmentsNeeded * 3, 120) : 30;
    const appointmentPerPersonPerSlot = Math.ceil(
      this.MAX_APPOINTMENTS_TOTAL / appointmentRequests.length / this.therapists.length,
    );
    this.MAX_APPOINTMENTS_PER_TIMEOFDAY_PER_THERAPIST = appointmentPerPersonPerSlot;
  }

  getSuggestions(): SingleAppointment[] {
    let suggestions: SingleAppointment[] = [];
    const currentSearchDate = new Date();
    for (let i = 0; i <= this.appointmentsNeeded + 2; i += 1) {
      suggestions = suggestions.concat(this.getSuggestionForWeek(currentSearchDate));
      currentSearchDate.setDate(currentSearchDate.getDate() + 7);
    }
    const suggestionsReduced = suggestions.slice();
    return suggestionsReduced;
  }

  private getSuggestionForWeek(startDate: Date): SingleAppointment[] {
    let suggestions: SingleAppointment[] = [];
    this.therapists.forEach((therapist, i) => {
      this.appointmentRequests.forEach((request) => {
        suggestions = suggestions.concat(
          this.getAppointmentForTherapistinRequest(
            therapist, this.therapistIDs[i], AppointmentFinder.timeMapping[request.timeOfDay], request.weekday, startDate,
          ),
        );
      });
    });
    const suggestionsReduced = suggestions.slice(0, Math.ceil(this.MAX_APPOINTMENTS_TOTAL / this.appointmentsNeeded));
    suggestionsReduced.sort((suggestionA, suggestionB) => suggestionA.date.getTime() - suggestionB.date.getTime());
    return suggestionsReduced;
  }

  private getAppointmentForTherapistinRequest(
    therapist: string, therapistID: string, times: string[], weekday: Weekday, startDate: Date,
  ): SingleAppointment[] {
    let foundCounter = 0;
    const foundAppointments: SingleAppointment[] = [];
    const searchingDate = AppointmentFinder.getNextDateForWeekday(weekday, startDate);
    times.every((time) => {
      if (foundCounter === AppointmentFinder.APPOINTMENTS_PER_WEEK) {
        return false;
      }
      const therapistAbsences = this.allTherapists.find((thera) => thera.id === therapistID)?.absences;
      if (therapistAbsences) {
        const foundAbsences = therapistAbsences.find(
          (abs) => (Time[abs.start] <= Time[time as unknown as Time]
          && Time[abs.end] > Time[time as unknown as Time]
          && (abs.day === weekday || abs.day === Dateconversions.convertDateToReadableString(searchingDate))),
        );
        if (foundAbsences || holidaysJSON.days.includes(
          Dateconversions.convertGermanToEnglishReadableString(Dateconversions.convertDateToReadableString(searchingDate)),
        )) {
          return true;
        }
      }
      const foundAppointment = this.daylist.searchAppointment(
        therapistID, Dateconversions.convertDateToReadableString(searchingDate), time as unknown as Time, this.appointmentLength === 40,
      );
      if (foundAppointment === undefined) {
        const hasConflict = this.masterlist.getAppointmentConflict(
          searchingDate, therapistID, time as unknown as Time,
        );
        const nextHasConflict = this.appointmentLength === 40 ? this.masterlist.getAppointmentConflict(
          searchingDate, therapistID, nextTime(time as unknown as Time),
        ) : false;
        if (!hasConflict && !nextHasConflict) {
          foundCounter += 1;
          foundAppointments.push(
            new SingleAppointment(therapist, therapistID, this.patient, time as unknown as Time, new Date(searchingDate.getTime())),
          );
        }
      }
      return true;
    });
    return foundAppointments;
  }

  private static getNextDateForWeekday(weekday: Weekday, startDate = new Date()) {
    let weekdayOffset = 1;

    switch (weekday) {
      case Weekday.MONDAY: weekdayOffset = 1; break;
      case Weekday.TUESDAY: weekdayOffset = 2; break;
      case Weekday.WEDNESDAY: weekdayOffset = 3; break;
      case Weekday.THURSDAY: weekdayOffset = 4; break;
      case Weekday.FRIDAY: weekdayOffset = 5; break;
      default: break;
    }

    // eslint-disable-next-line no-mixed-operators
    startDate.setDate(startDate.getDate() + ((7 - startDate.getDay()) % 7 + weekdayOffset) % 7);
    return startDate;
  }
}
