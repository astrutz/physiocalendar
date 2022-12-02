import { v4 as uuidv4 } from 'uuid';
import { Time } from './Enums';

export default class Appointment {
  id: string;

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
    id? : string,
  ) {
    this.id = id || uuidv4();
    this.therapist = therapist;
    this.therapistID = therapistID;
    this.patient = patient;
    this.startTime = startTime;
    this.endTime = endTime;
  }

  // eslint-disable-next-line class-methods-use-this
  calculateLength() : number {
    return parseInt(Time[this.endTime], 10) - parseInt(Time[this.startTime], 10);
  }
}
