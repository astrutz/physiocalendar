import Appointment from './Appointment';
import Cancellation from './Cancellation';
import { Time, Weekday } from './Enums';
import Therapist from './Therapist';
import Patient from './Patient';

export default class AppointmentSeries extends Appointment {

  weekday: Weekday;

  weeklyFrequency: number;

  cancellations: Cancellation[];

  cancellationIds: number[];

  startDate: Date;

  endDate: Date;

  isBWO: boolean;

  constructor(
    id: number,
    therapist: Therapist,
    therapistId: number,
    patient: Patient,
    patientId: number,
    startTime: Date,
    endTime: Date,
    startDate: Date,
    endDate: Date,
    comment: string,
    weekday: Weekday,
    weeklyFrequency: number,
    cancellations: Cancellation[],
    cancellationIds: number[],
    isBWO = false,
  ) {
    super(id, therapist, therapistId, patient, patientId, startTime, endTime, comment);
    this.weekday = weekday;
    this.weeklyFrequency = weeklyFrequency;
    this.cancellations = cancellations;
    this.cancellationIds = cancellationIds;
    this.startDate = startDate || new Date();
    this.endDate = endDate || new Date();
    this.isBWO = isBWO;
  }

  getTimeAsString(): string {
    return this.startTime.toDateString();
  }
}
