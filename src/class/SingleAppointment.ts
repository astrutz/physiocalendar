import Appointment from './Appointment';
import { Time } from './Enums';

export default class SingleAppointment extends Appointment {
  date : Date;

  constructor(
    therapist : string,
    therapistID : string,
    patient: string,
    startTime: Time,
    endTime: Time,
    comment: string,
    date: Date,
    id?: string,
  ) {
    super(therapist, therapistID, patient, startTime, endTime, comment, id);
    this.date = date;
  }
}
