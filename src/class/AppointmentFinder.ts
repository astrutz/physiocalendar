import AppointmentRequest from './AppointmentRequest';
import AppointmentSeries from './AppointmentSeries';
import { Time, Weekday } from './Enums';
// import AppointmentSuggestion from './AppointmentSuggestion';

export default class AppointmentFinder {
  patient: string;

  therapists: string[];

  appointmentRequests: AppointmentRequest[];

  // appointmentSuggestions : AppointmentSuggestion[];

  constructor(
    patient: string,
    therapists: string[],
    appointmentRequests: AppointmentRequest[],
    // appointmentSuggestions: AppointmentSuggestion[],
  ) {
    this.patient = patient;
    this.therapists = therapists;
    this.appointmentRequests = appointmentRequests;
    // this.appointmentSuggestions = appointmentSuggestions;
  }

  getSuggestions(): AppointmentSeries[] {
    // return [];
    return [new AppointmentSeries('Torben', this.patient, '10:00' as unknown as Time, Weekday.FRIDAY, false)];
  }
}
