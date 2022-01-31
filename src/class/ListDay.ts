import Appointment from './Appointment';

export default class ListDay {
  appointments : Appointment[];

  therapists : string[];

  constructor(
    appointments : Appointment[],
    therapists: string[],
  ) {
    this.appointments = appointments;
    this.therapists = therapists;
  }
}
