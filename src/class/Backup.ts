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
}
