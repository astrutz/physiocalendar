export default class Therapist {
  name: string;

  activeSince: Date;

  activeUntil: Date;

  constructor(
    name: string,
    activeSince: Date,
    activeUntil: Date,
  ) {
    this.name = name;
    this.activeSince = activeSince;
    this.activeUntil = activeUntil;
  }
}
