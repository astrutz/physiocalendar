/* eslint-disable semi */

import { Weekday } from './Enums';

export interface JSONAppointmentSeries {
  therapist : string,
  patient: string,
  time: string,
  hasEnd : boolean,
  startDate : number,
  endDate : number,
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
  activeSince: number;
  activeUntil: number;
}

export interface JSONBackup {
  createdDate: number;
  masterlist: JSONMasterlist;
  daylist: JSONDaylist;
  therapists: JSONTherapist[];
}
