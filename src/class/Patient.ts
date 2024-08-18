export default class Patient {
  id: number;
  
  firstName: string;

  lastName: string;

  activeSince: Date;

  activeUntil: Date;

  isBWO: boolean;

  constructor(
    id: number,
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

  static createEmpty(): Patient {
    return new Patient(
      0, // Initiale ID
      '', // Leerer Vorname
      '', // Leerer Nachname
      new Date(), // Aktives Datum seit heute
      new Date('2050-01-01'), // Aktives Datum bis in die Zukunft
      false // Standardwert für BWO
    );
  }
}
