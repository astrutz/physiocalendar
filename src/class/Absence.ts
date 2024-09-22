import { Weekday } from './Enums';

export default class Absence {
  id: number;

  therapistId: number;

  date: Date | null;
  
  weekday: Weekday | null;

  startTime : Date;

  endTime : Date;

  constructor(
    id: number,
    therapistId: number,
    date: Date | null,
    weekday: Weekday | null,
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
