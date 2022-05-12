import Appointment from './Appointment';
import { Time, Weekday } from './Enums';

export default class AppointmentSeries extends Appointment {
  weekday : Weekday;

  hasEnd : boolean;

  endDate : Date | null;

  startDate : Date;

  isBWO : boolean;

  constructor(
    therapist : string,
    patient: string,
    time: Time,
    weekday : Weekday,
    hasEnd : boolean,
    endDate? : Date,
    startDate? : Date,
    isBWO = false,
  ) {
    super(therapist, patient, time);
    this.weekday = weekday;
    this.hasEnd = hasEnd;
    this.endDate = endDate || null;
    this.startDate = startDate || new Date();
    this.isBWO = isBWO;
  }

  getTimeAsString() : string {
    return Time[this.time];
  }
}
