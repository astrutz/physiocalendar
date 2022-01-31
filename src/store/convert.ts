import Appointment from '@/class/Appointment';
import Backup from '@/class/Backup';
import Daylist from '@/class/Daylist';
import { JSONBackup, JSONDaylist, JSONMasterlist } from '@/class/JSONBackup';
import { Time, Weekday } from '@/class/Enums';
import ListSingleDay from '@/class/ListSingleDay';
import ListWeekDay from '@/class/ListWeekDay';
import Masterlist from '@/class/Masterlist';

function getListWeekDays(listWeekDaysJSON: JSONMasterlist): ListWeekDay[] {
  const listWeekDays = listWeekDaysJSON.elements.map((jsonElement) => {
    const appointments = jsonElement.appointments.map(
      (jsonAppointment) => new Appointment(jsonAppointment.therapist, jsonAppointment.patient, jsonAppointment.time as Time),
    );
    const { therapists } = jsonElement;
    const weekday = jsonElement.weekday as Weekday;
    return new ListWeekDay(appointments, therapists, weekday);
  });
  return listWeekDays;
}

function getListSingleDays(listSingleDaysJSON: JSONDaylist): ListSingleDay[] {
  const listSingleDays = listSingleDaysJSON.elements.map((jsonElement) => {
    const appointments = jsonElement.appointments.map(
      (jsonAppointment) => new Appointment(jsonAppointment.therapist, jsonAppointment.patient, jsonAppointment.time as Time),
    );
    const { therapists } = jsonElement;
    const date = new Date(jsonElement.date);
    return new ListSingleDay(appointments, therapists, date);
  });
  return listSingleDays;
}

export default function convertToBackup(responseData: JSONBackup): Backup {
  const createdDate = new Date(responseData.createdDate);
  const masterList = new Masterlist(getListWeekDays(responseData.masterlist));
  const dayList = new Daylist(getListSingleDays(responseData.daylist));

  // TODO: Convert JSON Data to a backup with JSONBackup interface
  return new Backup(masterList, dayList, createdDate);
}
