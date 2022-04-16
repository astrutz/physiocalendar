import { TimeOfDay, Weekday } from './Enums';

export default class AppointmentRequest {
  weekday: Weekday;

  timeOfDay: TimeOfDay;

  constructor(
    weekday: Weekday,
    timeOfDay: TimeOfDay,
  ) {
    this.weekday = weekday;
    this.timeOfDay = timeOfDay;
  }

  static generateAll(): AppointmentRequest[] {
    return [
      new AppointmentRequest(Weekday.MONDAY, TimeOfDay.MORNING),
      new AppointmentRequest(Weekday.MONDAY, TimeOfDay.FORENOON),
      new AppointmentRequest(Weekday.MONDAY, TimeOfDay.NOON),
      new AppointmentRequest(Weekday.MONDAY, TimeOfDay.AFTERNOON),
      new AppointmentRequest(Weekday.MONDAY, TimeOfDay.EVENING),
      new AppointmentRequest(Weekday.TUESDAY, TimeOfDay.MORNING),
      new AppointmentRequest(Weekday.TUESDAY, TimeOfDay.FORENOON),
      new AppointmentRequest(Weekday.TUESDAY, TimeOfDay.NOON),
      new AppointmentRequest(Weekday.TUESDAY, TimeOfDay.AFTERNOON),
      new AppointmentRequest(Weekday.TUESDAY, TimeOfDay.EVENING),
      new AppointmentRequest(Weekday.WEDNESDAY, TimeOfDay.MORNING),
      new AppointmentRequest(Weekday.WEDNESDAY, TimeOfDay.FORENOON),
      new AppointmentRequest(Weekday.WEDNESDAY, TimeOfDay.NOON),
      new AppointmentRequest(Weekday.WEDNESDAY, TimeOfDay.AFTERNOON),
      new AppointmentRequest(Weekday.WEDNESDAY, TimeOfDay.EVENING),
      new AppointmentRequest(Weekday.THURSDAY, TimeOfDay.MORNING),
      new AppointmentRequest(Weekday.THURSDAY, TimeOfDay.FORENOON),
      new AppointmentRequest(Weekday.THURSDAY, TimeOfDay.NOON),
      new AppointmentRequest(Weekday.THURSDAY, TimeOfDay.AFTERNOON),
      new AppointmentRequest(Weekday.THURSDAY, TimeOfDay.EVENING),
      new AppointmentRequest(Weekday.FRIDAY, TimeOfDay.MORNING),
      new AppointmentRequest(Weekday.FRIDAY, TimeOfDay.FORENOON),
      new AppointmentRequest(Weekday.FRIDAY, TimeOfDay.NOON),
      new AppointmentRequest(Weekday.FRIDAY, TimeOfDay.AFTERNOON),
      new AppointmentRequest(Weekday.FRIDAY, TimeOfDay.EVENING),
    ];
  }
}
