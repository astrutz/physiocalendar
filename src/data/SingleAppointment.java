package data;

import java.util.Date;

public class SingleAppointment extends Appointment {

  private Date date;

  public SingleAppointment(Therapist therapist, Patient patient, String time, Date date) {
    super(therapist, patient, time);
    this.date = date;
  }

  public Date getDate() {
    return date;
  }

  public void setDate(Date date) {
    this.date = date;
  }

}
