import Appointment from './Appointment';
import { Time, Weekday } from './Enums';

export default class AppointmentSeries extends Appointment {
  weekday : Weekday;

  hasEnd : boolean;

  endDate : Date | null;

  startDate : Date;

  constructor(
    therapist : string,
    patient: string,
    time: Time,
    weekday : Weekday,
    hasEnd : boolean,
    endDate? : Date,
    startDate? : Date,
  ) {
    super(therapist, patient, time);
    this.weekday = weekday;
    this.hasEnd = hasEnd;
    this.endDate = endDate || null;
    this.startDate = startDate || new Date();
  }
}
