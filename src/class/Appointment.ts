import { Time } from './Enums';

export default class Appointment {
  therapist : string;

  patient : string;

  time: Time;

  constructor(
    therapist : string,
    patient: string,
    time: Time,
  ) {
    this.therapist = therapist;
    this.patient = patient;
    this.time = time;
  }
}
