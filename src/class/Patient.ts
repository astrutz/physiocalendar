import Appointment from './Appointment';
import Therapist from './Therpist';

export default class Patient {
  name : string;

  therapist : Therapist;

  appointments : Appointment[];

  constructor(
    name : string,
    therapist : Therapist,
    appointments : Appointment[],
  ) {
    this.name = name;
    this.therapist = therapist;
    this.appointments = appointments;
  }
}
