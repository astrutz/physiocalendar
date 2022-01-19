package data;

public class ListWeekDay extends ListDay {

  private Weekday weekday;

  public ListWeekDay(Appointment[] appointments, Therapist[] therapists, Weekday weekday) {
    super(appointments, therapists);
    this.weekday = weekday;
  }

  public Weekday getWeekday() {
    return weekday;
  }

  public void setWeekday(Weekday weekday) {
    this.weekday = weekday;
  }

}
