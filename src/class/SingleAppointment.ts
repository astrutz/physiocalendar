import Appointment from './Appointment';
import Patient from './Patient';
import Therapist from './Therapist';

export default class SingleAppointment extends Appointment {
  date : Date;

  isHotair : boolean;

  isUltrasonic : boolean;

  isElectric : boolean;

  constructor(
    id: number,
    therapist : Therapist,
    therapistID : number,
    patient: Patient,
    patientId: number,
    startTime: Date,
    endTime: Date,
    comment: string,
    date: Date,
    isHotair: boolean,
    isUltrasonic: boolean,
    isElectric: boolean,
  ) {
    super(id, therapist, therapistID, patient, patientId, startTime, endTime, comment);
    this.date = date;
    this.isHotair = isHotair;
    this.isUltrasonic = isUltrasonic;
    this.isElectric = isElectric;
  }
}
