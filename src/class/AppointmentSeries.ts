import Appointment from './Appointment';
import { Weekday } from './Enums';
import Patient from './Patient';
import Therapist from './Therpist';

export default class AppointmentSeries extends Appointment {
  weekday : Weekday;

  hasEnd : boolean;

  startDate : Date;

  endDate : Date;

  constructor(
    therapist : Therapist,
    patient: Patient[],
    time: Date,
    weekday : Weekday,
    hasEnd : boolean,
    startDate : Date,
    endDate : Date,
  ) {
    super(therapist, patient, time);
    this.weekday = weekday;
    this.hasEnd = hasEnd;
    this.startDate = startDate;
    this.endDate = endDate;
  }
}
