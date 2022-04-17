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

  static timesOfDayToTimes(): {
    Morgens: string[];
    Vormittags: string[];
    Mittags: string[];
    Nachmittags: string[];
    Abends: string[];
    } {
    return {
      [TimeOfDay.MORNING]: [
        '7:00', '7:20', '7:40',
        '8:00', '8:20', '8:40',
        '9:00', '9:20', '9:40',
      ],
      [TimeOfDay.FORENOON]: [
        '10:00', '10:20', '10:40',
        '11:00', '11:20', '11:40',
      ],
      [TimeOfDay.NOON]: [
        '12:00', '12:20', '12:40',
        '13:00', '13:20', '13:40',
        '14:00', '14:20', '14:40',
      ],
      [TimeOfDay.AFTERNOON]: [
        '15:00', '15:20', '15:40',
        '16:00', '16:20', '16:40',
        '17:00', '17:20', '17:40',
      ],
      [TimeOfDay.EVENING]: [
        '18:00', '18:20', '18:40',
        '19:00', '19:20', '19:40',
        '20:00', '20:20', '20:40',
      ],
    };
  }
}
