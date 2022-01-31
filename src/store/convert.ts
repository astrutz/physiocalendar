import Appointment from '@/class/Appointment';
import Backup from '@/class/Backup';
import Daylist from '@/class/Daylist';
import {
  JSONBackup, JSONDaylist, JSONMasterlist, JSONTherapist,
} from '@/class/JSONBackup';
import { Time, Weekday } from '@/class/Enums';
import ListSingleDay from '@/class/ListSingleDay';
import ListWeekDay from '@/class/ListWeekDay';
import Masterlist from '@/class/Masterlist';
import Therapist from '@/class/Therapist';

function getListWeekDays(listWeekDaysJSON: JSONMasterlist): ListWeekDay[] {
  const listWeekDays = listWeekDaysJSON.elements.map((jsonElement) => {
    const appointments = jsonElement.appointments.map(
      (jsonAppointment) => new Appointment(jsonAppointment.therapist, jsonAppointment.patient, jsonAppointment.time as Time),
    );
    const weekday = jsonElement.weekday as Weekday;
    return new ListWeekDay(appointments, weekday);
  });
  return listWeekDays;
}

function getListSingleDays(listSingleDaysJSON: JSONDaylist): ListSingleDay[] {
  const listSingleDays = listSingleDaysJSON.elements.map((jsonElement) => {
    const appointments = jsonElement.appointments.map(
      (jsonAppointment) => new Appointment(jsonAppointment.therapist, jsonAppointment.patient, jsonAppointment.time as Time),
    );
    const date = new Date(jsonElement.date);
    return new ListSingleDay(appointments, date);
  });
  return listSingleDays;
}

function getTherapists(therapistsJSON: JSONTherapist[]): Therapist[] {
  const therapists = therapistsJSON.map((jsonElement) => {
    // 315532800000 is "01.01.1980"
    const activeSinceDate = jsonElement.activeSince === -1 ? new Date(315532800000) : new Date(jsonElement.activeSince);
    // 3471292800000 is "01.01.2080"
    const activeUntilDate = jsonElement.activeUntil === -1 ? new Date(3471292800000) : new Date(jsonElement.activeUntil);
    return new Therapist(jsonElement.name, activeSinceDate, activeUntilDate);
  });
  return therapists;
}

export default function convertToBackup(responseData: JSONBackup): Backup {
  const createdDate = new Date(responseData.createdDate);
  const masterList = new Masterlist(getListWeekDays(responseData.masterlist));
  const dayList = new Daylist(getListSingleDays(responseData.daylist));
  const therapists = getTherapists(responseData.therapists);

  return new Backup(masterList, dayList, createdDate, therapists);
}
