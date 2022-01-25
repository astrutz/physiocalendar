import { TimeOfDay, Weekday } from './Enums';

export default class AppointmentRequest {
  weekday : Weekday;

  timeOfDay: TimeOfDay;

  constructor(
    weekday : Weekday,
    timeOfDay : TimeOfDay,
  ) {
    this.weekday = weekday;
    this.timeOfDay = timeOfDay;
  }
}
