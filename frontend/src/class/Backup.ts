import Daylist from './Daylist';
import Masterlist from './Masterlist';

export default class Backup {
  createdDate : Date;

  masterlist : Masterlist;

  daylist : Daylist;

  constructor(
    masterlist : Masterlist,
    daylist : Daylist,
  ) {
    this.masterlist = masterlist;
    this.daylist = daylist;
    this.createdDate = new Date();
  }

  static import(fileName : string) : Backup {
    const backupString : string = JSON.stringify(backup);
    // TODO: Read from somewhere and create a Backup object
    // return new Backup(null, null);
  }

  static export(backup : Backup, fileName : string) : void {
    const backupString : string = JSON.stringify(backup);
    // TODO: Write this anywhere
  }
}
