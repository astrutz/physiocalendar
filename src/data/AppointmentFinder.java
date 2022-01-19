package data;

public class AppointmentFinder {
  private Patient patient;
  private Therapist[] therapists;
  private AppointmentRequest[] appointmentRequest;
  private AppointmentSuggestion[] appointmentSuggestions;

  public AppointmentFinder(Patient patient, Therapist[] therapists, AppointmentRequest[] appointmentRequest,
      AppointmentSuggestion[] appointmentSuggestions) {
    this.patient = patient;
    this.therapists = therapists;
    this.appointmentRequest = appointmentRequest;
    this.appointmentSuggestions = appointmentSuggestions;
  }

  public Patient getPatient() {
    return patient;
  }

  public void setPatient(Patient patient) {
    this.patient = patient;
  }

  public Therapist[] getTherapists() {
    return therapists;
  }

  public void setTherapists(Therapist[] therapists) {
    this.therapists = therapists;
  }

  public AppointmentRequest[] getAppointmentRequest() {
    return appointmentRequest;
  }

  public void setAppointmentRequest(AppointmentRequest[] appointmentRequest) {
    this.appointmentRequest = appointmentRequest;
  }

  public AppointmentSuggestion[] getAppointmentSuggestions() {
    return appointmentSuggestions;
  }

  public void setAppointmentSuggestions(AppointmentSuggestion[] appointmentSuggestions) {
    this.appointmentSuggestions = appointmentSuggestions;
  }

}
