import Backup from './Backup';

export default class Util {
  static searchPatientNames(backup: Backup, searchQuery: string) : string[] {
    let foundPatients : string[] = [];
    backup.masterlist.elements.forEach((listDay) => {
      foundPatients = foundPatients.concat(
        listDay.appointments.filter(
          (appointment) => appointment.patient && appointment.patient.toLowerCase().includes(searchQuery.toLowerCase()),
        ).map((appointment) => appointment.patient),
      );
    });
    backup.daylist.elements.forEach((listDay) => {
      foundPatients = foundPatients.concat(
        listDay.appointments.filter(
          (appointment) => appointment.patient && appointment.patient.toLowerCase().includes(searchQuery.toLowerCase()),
        ).map((appointment) => appointment.patient),
      );
    });
    return foundPatients;
  }
}
