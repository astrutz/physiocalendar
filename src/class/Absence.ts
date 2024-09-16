import { Weekday } from './Enums';

export default class Absence {
  id: number;

  therapistId: number;

  date: Date;
  
  weekday: Weekday;

  startTime : Date;

  endTime : Date;

  constructor(
    id: number,
    therapistId: number,
    date: Date,
    weekday: Weekday,
    startTime: Date,
    endTime: Date,
  ) {
    this.id = id;
    this.therapistId = therapistId;
    this.date = date;
    this.weekday = weekday;
    this.startTime = startTime;
    this.endTime = endTime;
  }
}
