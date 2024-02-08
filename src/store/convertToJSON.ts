import Absence from '@/class/Absence';
import AppointmentSeries from '@/class/AppointmentSeries';
import Backup from '@/class/Backup';
import Daylist from '@/class/Daylist';
import Exception from '@/class/Exception';
import {
  JSONAbsence,
  JSONAppointmentSeries,
  JSONBackup,
  JSONDaylist,
  JSONException,
  JSONListSingleDay,
  JSONListWeekDay,
  JSONMasterlist, JSONPatient, JSONSingleAppointment, JSONTherapist,
} from '@/class/JSONStructures';
import Masterlist from '@/class/Masterlist';
import Patient from '@/class/Patient';
import SingleAppointment from '@/class/SingleAppointment';
import Therapist from '@/class/Therapist';

function convertAppointmentSeries(appointments: AppointmentSeries[]): JSONAppointmentSeries[] {
  return appointments.map(
    (appointment) => (
      {
        id: appointment.id,
        therapist: appointment.therapist,
        therapistID: appointment.therapistID,
        patient: appointment.patient,
        patientId: appointment.patientId,
        startTime: appointment.startTime.toString(),
        endTime: appointment.endTime.toString(),
        startDate: appointment.startDate.getTime(),
        endDate: appointment.endDate.getTime(),
        isBWO: appointment.isBWO || false,
        interval: appointment.interval,
        cancellations: appointment.cancellations,
        comment: appointment.comment,
      }
    ),
  );
}

function convertMasterlist(masterlist: Masterlist): JSONMasterlist {
  const listWeekdays: JSONListWeekDay[] = masterlist.elements.map(
    (element) => {
      const appointmentSeries = convertAppointmentSeries(element.appointments as AppointmentSeries[]);
      return { weekday: element.weekday, appointments: appointmentSeries };
    },
  );
  return { elements: listWeekdays };
}

function convertSingleAppointments(appointments: SingleAppointment[]): JSONSingleAppointment[] {
  return appointments.map(
    (appointment) => (
      {
        id: appointment.id,
        therapist: appointment.therapist,
        therapistID: appointment.therapistID,
        patient: appointment.patient,
        patientId: appointment.patientId,
        startTime: appointment.startTime.toString(),
        endTime: appointment.endTime.toString(),
        comment: appointment.comment,
        isHotair: appointment.isHotair,
        isUltrasonic: appointment.isUltrasonic,
        isElectric: appointment.isElectric,
      }
    ),
  );
}

function convertDaylist(daylist: Daylist): JSONDaylist {
  const listSingleDays: JSONListSingleDay[] = daylist.elements.map(
    (element) => {
      const singleAppointments = convertSingleAppointments(element.appointments as SingleAppointment[]);
      return { date: element.date.getTime(), appointments: singleAppointments };
    },
  );
  return { elements: listSingleDays };
}

function convertExceptions(exceptions: Exception[]) : JSONException[] {
  return exceptions.map(
    (exception) => ({
      day: exception.day,
      start: exception.start.toString(),
      end: exception.end.toString(),
    }),
  );
}

function convertAbsences(absences : Absence[]) : JSONAbsence[] {
  return absences.map(
    (absence) => ({
      day: absence.day,
      start: absence.start.toString(),
      end: absence.end.toString(),
    }),
  );
}

function convertTherapists(therapists: Therapist[]): JSONTherapist[] {
  return therapists.map(
    (therapist) => {
      const activeSince = therapist.activeSince.getTime() === 315532800000 ? -1 : therapist.activeSince.getTime();
      const activeUntil = therapist.activeUntil.getTime() === 3471292800000 ? -1 : therapist.activeUntil.getTime();
      return {
        name: therapist.name,
        id: therapist.id,
        activeSince,
        activeUntil,
        absences: convertAbsences(therapist.absences),
        exceptions: convertExceptions(therapist.exceptions),
      };
    },
  );
}

function convertPatients(patients: Patient[]): JSONPatient[] {
  return patients.map(
    (patient) => {
      const activeSince = patient.activeSince.getTime() === 315532800000 ? -1 : patient.activeSince.getTime();
      const activeUntil = patient.activeUntil.getTime() === 3471292800000 ? -1 : patient.activeUntil.getTime();
      return {
        firstName: patient.firstName,
        name: patient.name,
        id: patient.id,
        activeSince,
        activeUntil,
        isBWO: patient.isBWO,
      };
    },
  );
}

export default function convertToJSON(backup: Backup): JSONBackup {
  const backupJSON = {
    createdDate: backup.createdDate.getTime(),
    masterlist: convertMasterlist(backup.masterlist),
    daylist: convertDaylist(backup.daylist),
    therapists: convertTherapists(backup.therapists),
    patients: convertPatients(backup.patients),
  };
  return backupJSON;
}
