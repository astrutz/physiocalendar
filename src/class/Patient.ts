export default class Patient {
  id: string;
  
  firstName: string;

  lastName: string;

  activeSince: Date;

  activeUntil: Date;

  isBWO: boolean;

  constructor(
    id: string,
    firstName: string,
    lastName: string,
    activeSince: Date,
    activeUntil: Date,
    isBWO: boolean,
  ) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.activeSince = activeSince;
    this.activeUntil = activeUntil;
    this.isBWO = isBWO;
  }
}
