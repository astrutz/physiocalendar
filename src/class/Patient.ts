export default class Patient {
  id: number;
  
  firstName: string;

  lastName: string;

  fullName: string;

  activeSince: Date;

  activeUntil: Date;

  isBWO: boolean;

  constructor(
    id: number,
    firstName: string,
    lastName: string,
    fullName: string,
    activeSince: Date,
    activeUntil: Date,
    isBWO: boolean,
  ) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.fullName = fullName;
    this.activeSince = activeSince;
    this.activeUntil = activeUntil;
    this.isBWO = isBWO;
  }

  static createEmpty(): Patient {
    return new Patient(
      0,
      '',
      '',
      '',
      new Date(), // Aktives Datum seit heute
      new Date('2050-01-01'), // Aktives Datum bis in die Zukunft
      false // Standardwert für BWO
    );
  }
}
