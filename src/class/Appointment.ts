import { Time } from './Enums';

export default class Appointment {
  therapist : string;

  therapistID : string;

  patient : string;

  startTime: Time;

  constructor(
    therapist : string,
    therapistID : string,
    patient: string,
    startTime: Time,
  ) {
    this.therapist = therapist;
    this.therapistID = therapistID;
    this.patient = patient;
    this.startTime = startTime;
  }
}
