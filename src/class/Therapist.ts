import Absence from './Absence';
import Exception from './Exception';

export default class Therapist {
  name: string;

  id: string;

  activeSince: Date;

  activeUntil: Date;

  absences: Absence[];

  exceptions: Exception[];

  constructor(
    name: string,
    id: string,
    activeSince: Date,
    activeUntil: Date,
    absences: Absence[],
    exceptions: Exception[],
  ) {
    this.name = name;
    this.id = id;
    this.activeSince = activeSince;
    this.activeUntil = activeUntil;
    this.absences = absences;
    this.exceptions = exceptions;
  }
}
