import Absence from './Absence';
import Exception from './AbsenceException';

export default class Therapist {
  name: string;

  id: number;

  activeSince: Date;

  activeUntil: Date;

  absences: Absence[];

  absenceIds: number[];

  absenceExceptions: Exception[];

  absenceExceptionIds: number[]

  constructor(
    id: number,
    name: string,
    activeSince: Date,
    activeUntil: Date,
    absences: Absence[],
    absenceIds: number[],
    absenceExceptions: Exception[],
    absenceExceptionIds: number[],
  ) {
    this.id = id;
    this.name = name;
    this.activeSince = activeSince;
    this.activeUntil = activeUntil;
    this.absences = absences;
    this.absenceIds = absenceIds;
    this.absenceExceptions = absenceExceptions;
    this.absenceExceptionIds = absenceExceptionIds;
  }

  static createEmpty(): Therapist {
    return new Therapist(
      0, // Initiale ID
      '', // Leerer Name
      new Date(), // Aktives Datum seit heute
      new Date('2050-01-01'), // Aktives Datum bis in die Zukunft
    [],
    [],
    [],
    []
    );
  }
}
