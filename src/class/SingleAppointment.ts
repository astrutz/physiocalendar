import Appointment from './Appointment';
import Patient from './Patient';
import Therapist from './Therpist';

export default class SingleAppointment extends Appointment {
  date : Date;

  constructor(
    therapist : Therapist,
    patient: Patient[],
    time: Date,
    date: Date,
  ) {
    super(therapist, patient, time);
    this.date = date;
  }
}
