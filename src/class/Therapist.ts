import Absence from './Absence';

export default class Therapist {
  name: string;

  id: string;

  activeSince: Date;

  activeUntil: Date;

  absences: Absence[];

  constructor(
    name: string,
    id: string,
    activeSince: Date,
    activeUntil: Date,
    absences: Absence[],
  ) {
    this.name = name;
    this.id = id;
    this.activeSince = activeSince;
    this.activeUntil = activeUntil;
    this.absences = absences;
  }
}
