package data;

public class Therapist {

  private String name;
  private Patient[] patients;
  private Appointment[] appointments;

  public Therapist(String name, Patient[] patients, Appointment[] appointments) {
    this.name = name;
    this.patients = patients;
    this.appointments = appointments;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public Patient[] getPatients() {
    return patients;
  }

  public void setPatients(Patient[] patients) {
    this.patients = patients;
  }

  public Appointment[] getAppointments() {
    return appointments;
  }

  public void setAppointments(Appointment[] appointments) {
    this.appointments = appointments;
  }

}
