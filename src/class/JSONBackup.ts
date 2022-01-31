import Appointment from './Appointment';
import { Weekday } from './Enums';

/* eslint-disable semi */
export interface JSONListWeekDay {
  weekday: Weekday;
  appointments: Appointment[];
}

export interface JSONMasterlist {
  elements: JSONListWeekDay[];
}

export interface JSONListSingleDay {
  date: number;
  appointments: Appointment[];
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
