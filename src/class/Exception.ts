import { Time } from './Enums';

export default class Exception {
  day: string;

  start : Time;

  end : Time;

  constructor(
    day: string,
    start : Time,
    end : Time,
  ) {
    this.day = day;
    this.start = start;
    this.end = end;
  }
}
