export default class Cancellation {
  date: string;

  patient: string;

  constructor(
    date: string,
    patient: string,
  ) {
    this.date = date;
    this.patient = patient;
  }
}
