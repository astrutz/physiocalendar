/* eslint-disable semi */

import { Weekday } from './Enums';

export interface JSONAppointmentSeries {
  therapist : string,
  therapistID : string,
  patient: string,
  time: string,
  startDate : number,
  isBWO : boolean
}

export interface JSONListWeekDay {
  weekday: Weekday;
  appointments: JSONAppointmentSeries[];
}

export interface JSONMasterlist {
  elements: JSONListWeekDay[];
}

export interface JSONSingleAppointment {
  therapist : string,
  therapistID : string,
  patient: string,
  time: string,
}

export interface JSONListSingleDay {
  date: number;
  appointments: JSONSingleAppointment[];
}

export interface JSONDaylist {
  elements: JSONListSingleDay[];
}

export interface JSONTherapist {
  name: string;
  id: string;
  activeSince: number;
  activeUntil: number;
}

export interface JSONAbsence {
  day: Weekday | string;
  start: string;
  end: string;
}

export interface JSONBackup {
  createdDate: number;
  masterlist: JSONMasterlist;
  daylist: JSONDaylist;
  therapists: JSONTherapist[];
  absences: JSONAbsence[]
}
