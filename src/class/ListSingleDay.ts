import Appointment from './Appointment';
import ListDay from './ListDay';
import Therapist from './Therpist';

export default class ListSingleDay extends ListDay {
  date : Date;

  constructor(
    appointments : Appointment[],
    therapists : Therapist[],
    date: Date,
  ) {
    super(appointments, therapists);
    this.date = date;
  }
}
