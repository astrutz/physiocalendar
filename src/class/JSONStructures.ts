/* eslint-disable semi */

import { Weekday } from './Enums';

export interface JSONCancellationDTO {
  id: number,
  date: Date
}

export interface JSONAppointmentSeriesDTO {
  id: number,
  therapist : JSONTherapistDTO,
  therapistId : number,
  patient: JSONPatientDTO,
  patientId: number,
  startTime: Date,
  endTime: Date,
  startDate: Date,
  endDate: Date,
  comment: string,
  isHotair: boolean,
  isUltrasonic: boolean,
  isElectric: boolean,
  isBWO: boolean,
  weekday: Weekday,
  weeklyFrequency: number,
  cancellations: JSONCancellationDTO[],
  cancellationIds: number[]
}

export interface JSONListWeekDayDTO {
  weekday: Weekday;
  appointments: JSONAppointmentSeriesDTO[];
}

export interface JSONMasterlistDTO {
  elements: JSONListWeekDayDTO[];
}

export interface JSONSingleAppointmentDTO {
  id: number,
  therapist: JSONTherapistDTO,
  therapistId: number,
  patient: JSONPatientDTO,
  patientId: number,
  startTime: Date,
  endTime: Date,
  date: Date,
  comment: string,
  isHotair: boolean,
  isUltrasonic: boolean,
  isElectric: boolean
}

export interface JSONListSingleDayDTO {
  date: number;
  appointments: JSONSingleAppointmentDTO[];
}

export interface JSONDaylistDTO {
  elements: JSONListSingleDayDTO[];
}

export interface JSONAbsenceExceptionDTO {
  id: number
  date: Date;
  weekday: Weekday;
  startTime: Date;
  endTime: Date;
}

export interface JSONAbsenceDTO {
  id: number;
  date: Date;
  weekday: Weekday;
  startTime: Date;
  endTime: Date;
}

export interface JSONTherapistDTO {
  name: string;
  id: number;
  activeSince: Date;
  activeUntil: Date;
  absences: JSONAbsenceDTO[];
  absenceIds: number[];
  absenceExceptions: JSONAbsenceExceptionDTO[];
  absenceExceptionIds: number[];
}

export interface JSONPatientDTO {
  id: string;
  firstName: string;
  lastName: string;
  activeSince: Date;
  activeUntil: Date;
  isBWO: boolean;
}

export interface JSONBackupDTO {
  createdDate: number;
  masterlist: JSONMasterlistDTO;
  daylist: JSONDaylistDTO;
  therapists: JSONTherapistDTO[];
  patients: JSONPatientDTO[];
}
