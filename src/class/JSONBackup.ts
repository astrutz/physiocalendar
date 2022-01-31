import Appointment from './Appointment';
import { Weekday } from './Enums';

/* eslint-disable semi */
export interface JSONListWeekDay {
  weekday: Weekday;
  therapists: string[];
  appointments: Appointment[];
}

export interface JSONMasterlist {
  elements: JSONListWeekDay[];
}

export interface JSONListSingleDay {
  date: number;
  therapists: string[];
  appointments: Appointment[];
}

export interface JSONDaylist {
  elements: JSONListSingleDay[];
}

export interface JSONBackup {
  createdDate: number;
  masterlist: JSONMasterlist;
  daylist: JSONDaylist;
}
