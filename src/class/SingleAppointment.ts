import Appointment from './Appointment';
import { Time } from './Enums';
import Patient from './Patient';
import Therapist from './Therapist';

export default class SingleAppointment extends Appointment {
  date : Date;

  constructor(
    therapist : Therapist,
    patient: Patient[],
    time: Time,
    date: Date,
  ) {
    super(therapist, patient, time);
    this.date = date;
  }
}
