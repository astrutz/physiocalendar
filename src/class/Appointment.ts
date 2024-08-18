import Therapist from './Therapist';
import Patient from './Patient';

export default class Appointment {
  id: number;

  therapist : Therapist;

  therapistId : number;

  patient : Patient;

  patientId : number;

  startTime: Date;

  endTime: Date;

  comment: string;


  constructor(
    id : number,
    therapist : Therapist,
    therapistId : number,
    patient: Patient,
    patientId: number,
    startTime: Date,
    endTime: Date,
    comment: string,
  ) {
    this.id = id;
    this.therapist = therapist;
    this.therapistId = therapistId;
    this.patient = patient;
    this.patientId = patientId;
    this.startTime = startTime;
    this.endTime = endTime;
    this.comment = comment;
  }

  // eslint-disable-next-line class-methods-use-this
  calculateLength() : number {
    return this.endTime.getTime() - this.startTime.getTime();
  }

  static createEmpty(): Appointment {
    return new Appointment(
      0, // Initiale ID, könnte auch null oder -1 sein, wenn noch keine ID vergeben wurde
      Therapist.createEmpty(), // Leerer Therapeut
      0, // Leere Therapist ID
      Patient.createEmpty(), // Leerer Patient
      0, // Leere Patient ID
      new Date(), // Startzeit auf das aktuelle Datum setzen
      new Date(), // Endzeit auf das aktuelle Datum setzen
      '' // Leerer Kommentar
    );
  }
}
