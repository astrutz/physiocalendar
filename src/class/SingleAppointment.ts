import Appointment from './Appointment';
import Patient from './Patient';
import Therapist from './Therapist';

export default class SingleAppointment extends Appointment {
  date : Date;

  createdBySeriesAppointment : boolean;

  isHotair : boolean;

  isUltrasonic : boolean;

  isElectric : boolean;

  constructor(
    id: number,
    therapist : Therapist,
    therapistId : number,
    patient: Patient,
    patientId: number,
    startTime: Date,
    endTime: Date,
    comment: string,
    date: Date,
    createdBySeriesAppointment: boolean,
    isHotair: boolean,
    isUltrasonic: boolean,
    isElectric: boolean,
  ) {
    super(id, therapist, therapistId, patient, patientId, startTime, endTime, comment);
    this.date = date;
    this.createdBySeriesAppointment = createdBySeriesAppointment;
    this.isHotair = isHotair;
    this.isUltrasonic = isUltrasonic;
    this.isElectric = isElectric;
  }

  static createEmpty(): SingleAppointment {
    return new SingleAppointment(
      0, // Initiale ID, könnte auch null oder -1 sein, wenn noch keine ID vergeben wurde
      Therapist.createEmpty(), // Leerer Therapeut
      0, // Leere Therapist ID
      Patient.createEmpty(), // Leerer Patient
      0, // Leere Patient ID
      new Date(), // Startzeit auf das aktuelle Datum setzen
      new Date(), // Endzeit auf das aktuelle Datum setzen
      '',
      new Date(),
      false,
      false,
      false,
      false,
    );
  }
}
