import Appointment from './Appointment';
import { Time } from './Enums';
import Patient from './Patient';
import Therapist from './Therapist';

export default class SingleAppointment extends Appointment {
  date : Date;

  weekdays: string[] = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

  isHotair : boolean;

  isUltrasonic : boolean;

  isElectric : boolean;

  weekday : string;

  constructor(
    id: number,
    therapist : Therapist,
    therapistID : number,
    patient: Patient,
    patientId: number,
    startTime: Date,
    endTime: Date,
    comment: string,
    date: Date,
    isHotair: boolean,
    isUltrasonic: boolean,
    isElectric: boolean,
  ) {
    super(id, therapist, therapistID, patient, patientId, startTime, endTime, comment);
    this.date = date;
    this.weekday = this.weekdays[date.getDay()];
    this.isHotair = isHotair;
    this.isUltrasonic = isUltrasonic;
    this.isElectric = isElectric;
  }
}
