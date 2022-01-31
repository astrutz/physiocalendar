import Appointment from './Appointment';
import ListDay from './ListDay';

export default class ListSingleDay extends ListDay {
  date : Date;

  constructor(
    appointments : Appointment[],
    date: Date,
  ) {
    super(appointments);
    this.date = date;
  }
}
