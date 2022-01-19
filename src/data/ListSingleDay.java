package data;

import java.util.Date;

public class ListSingleDay extends ListDay {

  private Date date;

  public ListSingleDay(Appointment[] appointments, Therapist[] therapists, Date date) {
    super(appointments, therapists);
    this.date = date;
  }

  public Date getDate() {
    return date;
  }

  public void setDate(Date date) {
    this.date = date;
  }

}
