package data;

public class Patient {

  private String name;
  private Therapist therapist;
  private Appointment[] appointments;

  public Patient(String name, Therapist therapist, Appointment[] appointments) {
    this.name = name;
    this.therapist = therapist;
    this.appointments = appointments;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public Therapist getTherapist() {
    return therapist;
  }

  public void setTherapist(Therapist therapist) {
    this.therapist = therapist;
  }

  public Appointment[] getAppointments() {
    return appointments;
  }

  public void setAppointments(Appointment[] appointments) {
    this.appointments = appointments;
  }

}
