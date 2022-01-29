import Appointment from './Appointment';
import { Weekday } from './Enums';
import ListDay from './ListDay';
import Therapist from './Therapist';

export default class ListWeekDay extends ListDay {
  weekday : Weekday;

  constructor(
    appointments : Appointment[],
    therapists : Therapist[],
    weekday: Weekday,
  ) {
    super(appointments, therapists);
    this.weekday = weekday;
  }
}
