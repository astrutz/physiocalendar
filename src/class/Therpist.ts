import Appointment from './Appointment';
import Patient from './Patient';

export default class Therapist {
  name: string;

  patients: Patient[];

  appointments: Appointment[];

  constructor(
    name : string,
    patients: Patient[],
    appointments: Appointment[],
  ) {
    this.name = name;
    this.patients = patients;
    this.appointments = appointments;
  }
}
