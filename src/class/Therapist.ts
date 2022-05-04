export default class Therapist {
  name: string;

  id: string;

  activeSince: Date;

  activeUntil: Date;

  constructor(
    name: string,
    id: string,
    activeSince: Date,
    activeUntil: Date,
  ) {
    this.name = name;
    this.id = id;
    this.activeSince = activeSince;
    this.activeUntil = activeUntil;
  }
}
