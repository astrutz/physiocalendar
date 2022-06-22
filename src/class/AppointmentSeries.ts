import Appointment from './Appointment';
import { Time, Weekday } from './Enums';

export default class AppointmentSeries extends Appointment {
  weekday: Weekday;

  cancellations: string[];

  startDate: Date;

  isBWO: boolean;

  constructor(
    therapist: string,
    therapistID: string,
    patient: string,
    time: Time,
    weekday: Weekday,
    cancellations: string[],
    startDate?: Date,
    isBWO = false,
  ) {
    super(therapist, therapistID, patient, time);
    this.weekday = weekday;
    this.cancellations = cancellations;
    this.startDate = startDate || new Date();
    this.isBWO = isBWO;
  }

  getTimeAsString(): string {
    return Time[this.time];
  }
}
