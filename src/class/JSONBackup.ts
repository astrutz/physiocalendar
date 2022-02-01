import AppointmentSeries from './AppointmentSeries';
import { Weekday } from './Enums';
import SingleAppointment from './SingleAppointment';

/* eslint-disable semi */
export interface JSONListWeekDay {
  weekday: Weekday;
  appointments: AppointmentSeries[];
}

export interface JSONMasterlist {
  elements: JSONListWeekDay[];
}

export interface JSONListSingleDay {
  date: number;
  appointments: SingleAppointment[];
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
