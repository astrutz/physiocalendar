import { Time } from './Enums';

export default class Appointment {
  therapist : string;

  therapistID : string;

  patient : string;

  time: Time;

  constructor(
    therapist : string,
    therapistID : string,
    patient: string,
    time: Time,
  ) {
    this.therapist = therapist;
    this.therapistID = therapistID;
    this.patient = patient;
    this.time = time;
  }
}
