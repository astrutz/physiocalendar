import { Time } from './Enums';

export default class Appointment {
  therapist : string;

  therapistID : string;

  patient : string;

  startTime: Time;

  endTime: Time;

  constructor(
    therapist : string,
    therapistID : string,
    patient: string,
    startTime: Time,
    endTime: Time,
  ) {
    this.therapist = therapist;
    this.therapistID = therapistID;
    this.patient = patient;
    this.startTime = startTime;
    this.endTime = endTime;
  }
}
