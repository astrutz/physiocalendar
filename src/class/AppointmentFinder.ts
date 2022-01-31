import AppointmentRequest from './AppointmentRequest';
import AppointmentSuggestion from './AppointmentSuggestion';

export default class AppointmentFinder {
  patient : string;

  therapists : string[];

  appointmentRequests : AppointmentRequest[];

  appointmentSuggestions : AppointmentSuggestion[];

  constructor(
    patient: string,
    therapists: string[],
    appointmentRequests : AppointmentRequest[],
    appointmentSuggestions: AppointmentSuggestion[],
  ) {
    this.patient = patient;
    this.therapists = therapists;
    this.appointmentRequests = appointmentRequests;
    this.appointmentSuggestions = appointmentSuggestions;
  }
}
