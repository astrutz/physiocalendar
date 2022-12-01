/* eslint-disable semi */

import { Weekday } from './Enums';

export interface JSONAppointmentSeries {
  id: string,
  therapist : string,
  therapistID : string,
  patient: string,
  startTime: string,
  endTime: string,
  startDate : number,
  isBWO : boolean,
  interval: number,
  cancellations: string[]
}

export interface JSONListWeekDay {
  weekday: Weekday;
  appointments: JSONAppointmentSeries[];
}

export interface JSONMasterlist {
  elements: JSONListWeekDay[];
}

export interface JSONSingleAppointment {
  id: string,
  therapist : string,
  therapistID : string,
  patient: string,
  startTime: string,
  endTime: string,
}

export interface JSONListSingleDay {
  date: number;
  appointments: JSONSingleAppointment[];
}

export interface JSONDaylist {
  elements: JSONListSingleDay[];
}

export interface JSONAbsence {
  day: Weekday | string;
  start: string;
  end: string;
}

export interface JSONTherapist {
  name: string;
  id: string;
  activeSince: number;
  activeUntil: number;
  absences: JSONAbsence[];
}

export interface JSONBackup {
  createdDate: number;
  masterlist: JSONMasterlist;
  daylist: JSONDaylist;
  therapists: JSONTherapist[];
}
