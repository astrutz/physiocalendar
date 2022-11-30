import Appointment from './Appointment';
import { Time, Weekday } from './Enums';

export default class AppointmentSeries extends Appointment {
  weekday: Weekday;

  interval: number;

  cancellations: string[];

  startDate: Date;

  isBWO: boolean;

  constructor(
    therapist: string,
    therapistID: string,
    patient: string,
    startTime: Time,
    weekday: Weekday,
    interval: number,
    cancellations: string[],
    startDate?: Date,
    isBWO = false,
  ) {
    super(therapist, therapistID, patient, startTime);
    this.weekday = weekday;
    this.interval = interval;
    this.cancellations = cancellations;
    this.startDate = startDate || new Date();
    this.isBWO = isBWO;
  }

  getTimeAsString(): string {
    return Time[this.startTime];
  }
}
