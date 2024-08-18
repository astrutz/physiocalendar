import { Weekday } from "./Enums";

export default class AbsenceException {
  id: number;

  date: Date;

  weekday: Weekday;

  startTime : Date;

  endTime : Date;

  constructor(
    id: number,
    date: Date,
    weekday: Weekday,
    startTime: Date,
    endTime: Date,
  ) {
    this.id = id;
    this.date = date;
    this.weekday = weekday;
    this.startTime = startTime;
    this.endTime = endTime;
  }
}
