import { Time } from './Enums';

export default class AbsenceException {
  id: number;

  date: Date;

  startTime : Date;

  endTime : Date;

  constructor(
    id: number,
    date: Date,
    startTime: Date,
    endTime: Date,
  ) {
    this.id = id;
    this.date = date;
    this.startTime = startTime;
    this.endTime = endTime;
  }
}
