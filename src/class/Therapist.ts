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
    name: string,
    id: number,
    activeSince: Date,
    activeUntil: Date,
    absences: Absence[],
    absenceIds: number[],
    absenceExceptions: Exception[],
    absenceExceptionIds: number[],
  ) {
    this.name = name;
    this.id = id;
    this.activeSince = activeSince;
    this.activeUntil = activeUntil;
    this.absences = absences;
    this.absenceIds = absenceIds;
    this.absenceExceptions = absenceExceptions;
    this.absenceExceptionIds = absenceExceptionIds;
  }
}
