import Appointment from './Appointment';
import Cancellation from './Cancellation';
import { Time, Weekday } from './Enums';

export default class AppointmentSeries extends Appointment {
  weekday: Weekday;

  interval: number;

  cancellations: Cancellation[];

  startDate: Date;

  isBWO: boolean;

  constructor(
    therapist: string,
    therapistID: string,
    patient: string,
    startTime: Time,
    endTime: Time,
    comment: string,
    weekday: Weekday,
    interval: number,
    cancellations: Cancellation[],
    startDate?: Date,
    id?: string,
    isBWO = false,
  ) {
    super(therapist, therapistID, patient, startTime, endTime, comment, id);
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
