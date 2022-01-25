import AppointmentRequest from './AppointmentRequest';
import AppointmentSuggestion from './AppointmentSuggestion';
import Patient from './Patient';
import Therapist from './Therpist';

export default class AppointmentFinder {
  patient : Patient;

  therapists : Therapist[];

  appointmentRequests : AppointmentRequest[];

  appointmentSuggestions : AppointmentSuggestion[];

  constructor(
    patient: Patient,
    therapists: Therapist[],
    appointmentRequests : AppointmentRequest[],
    appointmentSuggestions: AppointmentSuggestion[],
  ) {
    this.patient = patient;
    this.therapists = therapists;
    this.appointmentRequests = appointmentRequests;
    this.appointmentSuggestions = appointmentSuggestions;
  }
}
