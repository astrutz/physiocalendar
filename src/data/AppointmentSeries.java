package data;

import java.util.Date;

public class AppointmentSeries extends Appointment {

  private Weekday weekday;
  private boolean hasEnd;
  private Date startDate;
  private Date endDate;

  public AppointmentSeries(Therapist therapist, Patient patient, String time, Weekday weekday, boolean hasEnd,
      Date startDate, Date endDate) {
    super(therapist, patient, time);
    this.weekday = weekday;
    this.hasEnd = hasEnd;
    this.startDate = startDate;
    this.endDate = endDate;
  }

  public Weekday getWeekday() {
    return weekday;
  }

  public void setWeekday(Weekday weekday) {
    this.weekday = weekday;
  }

  public boolean isHasEnd() {
    return hasEnd;
  }

  public void setHasEnd(boolean hasEnd) {
    this.hasEnd = hasEnd;
  }

  public Date getStartDate() {
    return startDate;
  }

  public void setStartDate(Date startDate) {
    this.startDate = startDate;
  }

  public Date getEndDate() {
    return endDate;
  }

  public void setEndDate(Date endDate) {
    this.endDate = endDate;
  }

}
