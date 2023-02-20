export default class Cancellation {
  date: string;

  patient: string;

  // repAppointmentIds: string[];

  constructor(
    date: string,
    patient: string,
    // repAppointmentIds: string[],
  ) {
    this.date = date;
    this.patient = patient;
    // this.repAppointmentIds = repAppointmentIds;
  }
}
