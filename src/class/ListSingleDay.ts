import Appointment from './Appointment';
import ListDay from './ListDay';

export default class ListSingleDay extends ListDay {
  date : Date;

  constructor(
    appointments : Appointment[],
    therapists : string[],
    date: Date,
  ) {
    super(appointments, therapists);
    this.date = date;
  }
}
