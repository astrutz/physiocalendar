import { Time } from './Enums';
import Patient from './Patient';
import Therapist from './Therapist';

export default class Appointment {
  therapist : Therapist;

  patient : Patient[];

  time: Time;

  constructor(
    therapist : Therapist,
    patient: Patient[],
    time: Time,
  ) {
    this.therapist = therapist;
    this.patient = patient;
    this.time = time;
  }
}
