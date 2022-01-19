package data;

public class AppointmentSuggestion {
  private Appointment[] appointments;

  public AppointmentSuggestion(Appointment[] appointments) {
    this.appointments = appointments;
  }

  public Appointment[] getAppointments() {
    return appointments;
  }

  public void setAppointments(Appointment[] appointments) {
    this.appointments = appointments;
  }

}
