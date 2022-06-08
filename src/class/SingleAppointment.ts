import Appointment from './Appointment';
import { Time } from './Enums';

export default class SingleAppointment extends Appointment {
  date : Date;

  constructor(
    therapist : string,
    therapistID : string,
    patient: string,
    time: Time,
    date: Date,
  ) {
    super(therapist, therapistID, patient, time);
    this.date = date;
  }
}
