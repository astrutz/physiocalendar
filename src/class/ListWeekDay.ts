import Appointment from './Appointment';
import { Weekday } from './Enums';
import ListDay from './ListDay';

export default class ListWeekDay extends ListDay {
  weekday : Weekday;

  constructor(
    appointments : Appointment[],
    therapists : string[],
    weekday: Weekday,
  ) {
    super(appointments, therapists);
    this.weekday = weekday;
  }
}
