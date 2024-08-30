import Absence from './Absence';
import Exception from './AbsenceException';

export default class Therapist {
 
  id: number;

  firstName: string;

  lastName: string;

  fullName: string;

  activeSince: Date;

  activeUntil: Date;

  isActive: boolean;

  absences: Absence[];

  absenceIds: number[];

  absenceExceptions: Exception[];

  absenceExceptionIds: number[]

  constructor(
    id: number,
    firstName: string,
    lastName: string,
    fullName: string,
    activeSince: Date,
    activeUntil: Date,
    isActive:  boolean,
    absences: Absence[],
    absenceIds: number[],
    absenceExceptions: Exception[],
    absenceExceptionIds: number[],
  ) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.fullName = fullName;
    this.activeSince = activeSince;
    this.activeUntil = activeUntil;
    this.isActive = isActive;
    this.absences = absences;
    this.absenceIds = absenceIds;
    this.absenceExceptions = absenceExceptions;
    this.absenceExceptionIds = absenceExceptionIds;
  }

  static createEmpty(): Therapist {
    return new Therapist(
      0, // Initiale ID
      '',
      '',
      '',
      new Date(), // Aktives Datum seit heute
      new Date('2050-01-01'), // Aktives Datum bis in die Zukunft
      true,
    [],
    [],
    [],
    []
    );
  }
}
