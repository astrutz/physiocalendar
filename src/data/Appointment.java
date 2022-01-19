package data;

public class Appointment {

  private Therapist therapist;
  private Patient patient;
  private String time;

  public Appointment(Therapist therapist, Patient patient, String time) {
    this.therapist = therapist;
    this.patient = patient;
    this.time = time;
  }

  public Therapist getTherapist() {
    return therapist;
  }

  public void setTherapist(Therapist therapist) {
    this.therapist = therapist;
  }

  public Patient getPatient() {
    return patient;
  }

  public void setPatient(Patient patient) {
    this.patient = patient;
  }

  public String getTime() {
    return time;
  }

  public void setTime(String time) {
    this.time = time;
  }

  
  
}
