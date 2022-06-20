import { Time } from './Enums';

export default class Absences {
  start : Time;

  end : Time;

  constructor(
    start : Time,
    end : Time,
  ) {
    this.start = start;
    this.end = end;
  }
}
