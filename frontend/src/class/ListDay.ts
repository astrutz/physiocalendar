import Appointment from './Appointment';
import Therapist from './Therapist';

export default class ListDay {
  appointments : Appointment[];

  therapists : Therapist[];

  constructor(
    appointments : Appointment[],
    therapists: Therapist[],
  ) {
    this.appointments = appointments;
    this.therapists = therapists;
  }
}
