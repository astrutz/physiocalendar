package data;

import java.io.Serializable;

public class ListDay implements Serializable {
  private Appointment[] appointments;
  private Therapist[] therapists;

  public ListDay(Appointment[] appointments, Therapist[] therapists) {
    this.appointments = appointments;
    this.therapists = therapists;
  }

  public Appointment[] getAppointments() {
    return appointments;
  }

  public void setAppointments(Appointment[] appointments) {
    this.appointments = appointments;
  }

  public Therapist[] getTherapists() {
    return therapists;
  }

  public void setTherapists(Therapist[] therapists) {
    this.therapists = therapists;
  }

}
