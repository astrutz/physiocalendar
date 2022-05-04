import AppointmentSeries from '@/class/AppointmentSeries';
import Backup from '@/class/Backup';
import Daylist from '@/class/Daylist';
import {
  JSONAppointmentSeries,
  JSONBackup, JSONDaylist, JSONListSingleDay, JSONListWeekDay, JSONMasterlist, JSONSingleAppointment, JSONTherapist,
} from '@/class/JSONStructures';
import Masterlist from '@/class/Masterlist';
import SingleAppointment from '@/class/SingleAppointment';
import Therapist from '@/class/Therapist';

function convertAppointmentSeries(appointments: AppointmentSeries[]): JSONAppointmentSeries[] {
  return appointments.map(
    (appointment) => (
      {
        therapist: appointment.therapist,
        patient: appointment.patient,
        time: appointment.time.toString(),
        hasEnd: appointment.hasEnd,
        startDate: appointment.startDate.getTime(),
        endDate: appointment.endDate ? appointment.endDate.getTime() : null,
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
        therapist: appointment.therapist,
        patient: appointment.patient,
        time: appointment.time.toString(),
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

function convertTherapists(therapists: Therapist[]): JSONTherapist[] {
  return therapists.map(
    (therapist) => {
      const activeSince = therapist.activeSince.getTime() === 315532800000 ? -1 : therapist.activeSince.getTime();
      const activeUntil = therapist.activeUntil.getTime() === 3471292800000 ? -1 : therapist.activeUntil.getTime();
      return {
        name: therapist.name, id: therapist.id, activeSince, activeUntil,
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
  };
  return backupJSON;
}
