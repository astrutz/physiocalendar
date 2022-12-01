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
    date: Date,
  ) {
    super(therapist, therapistID, patient, startTime, endTime);
    this.date = date;
  }
}
