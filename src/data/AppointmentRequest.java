package data;

public class AppointmentRequest {
  private Weekday weekday;
  private TimeOfDay timeOfDay;

  public AppointmentRequest(Weekday weekday, TimeOfDay timeOfDay) {
    this.weekday = weekday;
    this.timeOfDay = timeOfDay;
  }

  public Weekday getWeekday() {
    return weekday;
  }

  public void setWeekday(Weekday weekday) {
    this.weekday = weekday;
  }

  public TimeOfDay getTimeOfDay() {
    return timeOfDay;
  }

  public void setTimeOfDay(TimeOfDay timeOfDay) {
    this.timeOfDay = timeOfDay;
  }

}
