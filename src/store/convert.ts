import Therapist from '@/class/Therapist';
import Absence from '@/class/Absence';
import AppointmentSeries from '@/class/AppointmentSeries';
import Cancellation from '@/class/Cancellation';
import { JSONAbsenceDTO, JSONAbsenceExceptionDTO, JSONAppointmentSeriesDTO, JSONCancellationDTO, JSONPatientDTO, JSONSingleAppointmentDTO,
JSONTherapistDTO } from '@/class/JSONStructures';
import SingleAppointment from '@/class/SingleAppointment';
import AbsenceException from '@/class/AbsenceException';
import { Weekday } from '../class/Enums';
import Patient from '@/class/Patient';

export function convertToTherapist(dto: any): Therapist {
  return new Therapist(
    dto.name,
    dto.id,
    new Date(dto.activeSince),
    new Date(dto.activeUntil),
    dto.absences ? dto.absences.map(convertToAbsence) : [],
    dto.absenceIds ? dto.absenceIds : [],
    dto.absenceExceptions ? dto.absenceExceptions.map(convertToAbsenceException) : [],
    dto.absenceExceptionIds ? dto.absenceExceptionIds : [],
  );
}

export function convertToTherapistDTO(therapist: Therapist): JSONTherapistDTO {
  return {
    name: therapist.name,
    id: therapist.id,
    activeSince: therapist.activeSince,
    activeUntil: therapist.activeUntil,
    absences: therapist.absences ? therapist.absences.map(convertToAbsenceDTO) : [],
    absenceIds: therapist.absenceIds,
    absenceExceptions: therapist.absenceExceptions ? therapist.absenceExceptions.map(convertToAbsenceExceptionDTO) : [],
    absenceExceptionIds: therapist.absenceExceptionIds,
  };
}

export function convertToPatient(patient: JSONPatientDTO): Patient {
    return new Patient(
      patient.id,
      patient.firstName,
      patient.lastName,
      patient.activeSince,
      patient.activeUntil,
      patient.isBWO,
    );
  }
  
  export function convertToPatientDTO(patient: Patient): JSONPatientDTO {
    return {
      id: patient.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      activeSince: patient.activeSince,
      activeUntil: patient.activeUntil,
      isBWO: patient.isBWO,
    };
  }

export function convertToAbsence(dto: any): Absence {
  return new Absence(dto.id, dto.date, dto.weekday, dto.start, dto.end);
}

export function convertToAbsenceDTO(absence: Absence): JSONAbsenceDTO {
  return {
    id: absence.id,
    date: absence.date,
    weekday: absence.weekday,
    startTime: absence.startTime,
    endTime: absence.endTime,
  };
}

export function convertToAbsenceException(absenceException: JSONAbsenceExceptionDTO): AbsenceException {
  return new AbsenceException(absenceException.id, absenceException.date, absenceException.weekday, absenceException.startTime, absenceException.endTime);
}

export function convertToAbsenceExceptionDTO(exception: AbsenceException): JSONAbsenceExceptionDTO {
  return {
    id: exception.id,
    date: exception.date,
    weekday: exception.weekday,
    startTime: exception.startTime,
    endTime: exception.endTime,
  };
}
export function convertToAppointment(appointment: JSONSingleAppointmentDTO): SingleAppointment {
  return new SingleAppointment(
    appointment.id,
    convertToTherapist(appointment.therapist),
    appointment.therapistId,
    appointment.patient,
    appointment.patientId,
    new Date(appointment.startTime),
    new Date(appointment.endTime),
    appointment.comment,
    appointment.date,
    appointment.isHotair,
    appointment.isUltrasonic,
    appointment.isElectric,
  );
}

export function convertToAppointmentDTO(appointment: SingleAppointment): JSONSingleAppointmentDTO {
  return {
    id: appointment.id,
    therapist: convertToTherapistDTO( appointment.therapist),
    therapistId: appointment.therapistId,
    patient: convertToPatientDTO(appointment.patient),
    patientId: appointment.patientId,
    date: appointment.date,
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    comment: appointment.comment,
    isHotair: appointment.isHotair,
    isUltrasonic: appointment.isUltrasonic,
    isElectric: appointment.isElectric,
  };
}

export function convertToAppointmentSeries(appointmentSeries: JSONAppointmentSeriesDTO): AppointmentSeries {
  return new AppointmentSeries(
    appointmentSeries.id,
    appointmentSeries.therapistId,
    convertToTherapist(appointmentSeries.therapist),
    appointmentSeries.patient,
    appointmentSeries.patientId,
    new Date(appointmentSeries.startTime),
    new Date(appointmentSeries.endTime),
    new Date(appointmentSeries.startDate),
    new Date(appointmentSeries.endDate),
    appointmentSeries.comment,
    appointmentSeries.isHotair,
    appointmentSeries.isUltrasonic,
    appointmentSeries.isElectric,
    appointmentSeries.weekday,
    appointmentSeries.weeklyFrequency,
    appointmentSeries.cancellations ? appointmentSeries.cancellations.map(convertToCancellation) : [],
    appointmentSeries.cancellationIds,
    appointmentSeries.isBWO
  );
}

export function convertToAppointmentSeriesDTO(appointmentSeries: AppointmentSeries): JSONAppointmentSeriesDTO {
  return {
    id: appointmentSeries.id,
    therapist: convertToTherapistDTO(appointmentSeries.therapist),
    therapistId: appointmentSeries.therapistId,
    patient: convertToPatientDTO(appointmentSeries.patient),
    patientId: appointmentSeries.patientId,
    startTime: appointmentSeries.startTime,
    endTime: appointmentSeries.endTime,
    comment: appointmentSeries.comment,
    startDate: appointmentSeries.startDate,
    endDate: appointmentSeries.endDate,
    weeklyFrequency: appointmentSeries.weeklyFrequency,
    weekday: appointmentSeries.weekday,
    cancellations: appointmentSeries.cancellations ? appointmentSeries.cancellations.map(convertToCancellationDTO) : [],
    cancellationIds: appointmentSeries.cancellationIds,
    isBWO: appointmentSeries.isBWO,
    isElectric: appointmentSeries.isElectric,
    isHotair: appointmentSeries.isHotair,
    isUltrasonic: appointmentSeries.isUltrasonic
  };
}

export function convertToCancellation(cancellation: JSONCancellationDTO): Cancellation {
  return new Cancellation(cancellation.id, cancellation.date);
}

export function convertToCancellationDTO(cancellation: Cancellation): any {
  return {
    id: cancellation.id,
    date: cancellation.date,
  };
}
