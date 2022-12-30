import Appointment from './Appointment';
import { Time } from './Enums';

export default class SingleAppointment extends Appointment {
  date : Date;

  isHotair : boolean;

  isUltrasonic : boolean;

  isElectric : boolean;

  constructor(
    therapist : string,
    therapistID : string,
    patient: string,
    startTime: Time,
    endTime: Time,
    comment: string,
    date: Date,
    isHotair: boolean,
    isUltrasonic: boolean,
    isElectric: boolean,
    id?: string,
  ) {
    super(therapist, therapistID, patient, startTime, endTime, comment, id);
    this.date = date;
    this.isHotair = isHotair;
    this.isUltrasonic = isUltrasonic;
    this.isElectric = isElectric;
  }
}
