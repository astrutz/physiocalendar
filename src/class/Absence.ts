import { Time, Weekday } from './Enums';

export default class Absence {
  id: number;

  date: Date;
  
  weekday: Weekday;

  startTime : Time;

  endTime : Time;

  constructor(
    id: number,
    date: Date,
    weekday: Weekday,
    startTime: Time,
    endTime: Time,
  ) {
    this.id = id;
    this.date = date;
    this.weekday = weekday;
    this.startTime = startTime;
    this.endTime = endTime;
  }
}
