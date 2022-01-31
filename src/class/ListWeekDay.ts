import Appointment from './Appointment';
import { Weekday } from './Enums';
import ListDay from './ListDay';

export default class ListWeekDay extends ListDay {
  weekday : Weekday;

  constructor(
    appointments : Appointment[],
    weekday: Weekday,
  ) {
    super(appointments);
    this.weekday = weekday;
  }
}
