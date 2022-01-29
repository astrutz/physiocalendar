import Appointment from './Appointment';

export default class AppointmentSuggestion {
  appointments : Appointment[];

  constructor(
    appointments : Appointment[],
  ) {
    this.appointments = appointments;
  }
}
