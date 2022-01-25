import Patient from './Patient';
import Therapist from './Therpist';

export default class Appointment {
  therapist : Therapist;

  patient : Patient[];

  time: string;

  constructor(
    therapist : Therapist,
    patient: Patient[],
    time: Date,
  ) {
    this.therapist = therapist;
    this.patient = patient;
    this.time = `${time.getHours()}:${time.getMinutes()}`;
  }
}
