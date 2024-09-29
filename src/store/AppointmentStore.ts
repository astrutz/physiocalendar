// src/stores/appointmentStore.ts
import { defineStore } from 'pinia';
import SingleAppointment from '@/class/SingleAppointment';
import { JSONSingleAppointmentDTO } from '@/class/JSONStructures';
import { convertToAppointment, convertToAppointmentDTO } from './convert';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import apiClient from './apiClient';

export const useAppointmentStore = defineStore('appointment', {
  state: () => ({
    appointments: [] as SingleAppointment[],
    appointmentConflicts: [] as SingleAppointment[],
  }),

  actions: {
    async loadAppointments(params?: { date?: Date; therapistId?: number; patientId?: number }): Promise<void> {
      try {
        const queryString = params ? this.buildQueryString(params) : '';
        
        // Führe die Anfrage aus
        const responseData: JSONSingleAppointmentDTO[] = (await apiClient.get(`appointments${queryString}`)).data;
    
        if (responseData.length === 0) {
          // Wenn die zurückgegebene Liste leer ist, Liste der appointments leeren
          this.appointments = [];
          console.log('Keine Termine für den ausgewählten Zeitraum.');
        } else {
          // Konvertiere die DTOs in Appointment-Objekte
          this.appointments = responseData.map((dto: JSONSingleAppointmentDTO) => convertToAppointment(dto));
        }
      } catch (err) {
        console.error(err);
        toast.error('Fehler beim Laden der Termine.');
      }
    },
    

    async loadAppointmentsForDate(date: Date): Promise<void> {
      try {
        // Konvertiere das Datum ins ISO-Format (yyyy-MM-dd)
        const formattedDate = date.toISOString().split('T')[0];
        
        // API-Aufruf
        const responseData = (await apiClient.get(`/appointments/date?date=${formattedDate}`)).data;
    
        // Überprüfe, ob die Antwort leer ist
        if (responseData.length === 0) {
          console.log('Keine Termine für den ausgewählten Tag.');
          this.appointments = []; // Leere Liste zuweisen, wenn keine Termine gefunden wurden
        } else {
          // Konvertiere die DTOs in Appointment-Objekte
          this.appointments = responseData.map((dto: JSONSingleAppointmentDTO) => convertToAppointment(dto));
        }
        
      } catch (err) {
        console.error(err);
        toast.error('Fehler beim Laden der Termine.');
      }
    },

    async loadAppointmentConflicts(): Promise<void> {
      try {
        const responseData: JSONSingleAppointmentDTO[] = (await apiClient.get('appointments/conflicts')).data;
        if (responseData) {
          this.appointmentConflicts = responseData.map(dto => convertToAppointment(dto));
          if (this.appointmentConflicts.length > 0) {
            toast.info('Es wurden Konflikte in den Terminen gefunden.');
          }
        }
      } catch (err) {
        console.error('Fehler beim Laden der Terminkonflikte:', err);
        toast.error('Fehler beim Laden der Terminkonflikte.');
      }
    },

    async addAppointment(appointment: SingleAppointment): Promise<void> {
      try {
        const appointmentDTO = convertToAppointmentDTO(appointment);
        await apiClient.post('appointments', appointmentDTO);
        toast.success("Termin erfolgreich erstellt.");
      } catch (err) {
        console.error(err);
        toast.error('Fehler beim Erstellen des Termins.');
      }
    },

    async updateAppointment(id: number, appointment: SingleAppointment): Promise<void> {
      try {
        const appointmentDTO = convertToAppointmentDTO(appointment);
        await apiClient.put(`appointments/${id}`, appointmentDTO);
        toast.success('Termin erfolgreich aktualisiert.');
      } catch (err) {
        console.error(err);
        toast.error('Fehler beim Aktualisieren des Termins.');
      }
    },

    async deleteAppointment(id: number): Promise<void> {
      try {
        await apiClient.delete(`appointments/${id}`);
        toast.success('Termin erfolgreich gelöscht.');
      } catch (err) {
        console.error(err);
        toast.error('Fehler beim Löschen des Termins.');
      }
    },

    buildQueryString(params: { date?: Date; therapistId?: number; patientId?: number }): string {
      const queryParts: string[] = [];

      if (params.date) {
        const formattedDate = params.date.toISOString().split('T')[0];
        queryParts.push(`date=${encodeURIComponent(formattedDate)}`);
      }

      if (params.therapistId !== undefined) {
        queryParts.push(`therapistId=${encodeURIComponent(params.therapistId)}`);
      }

      if (params.patientId !== undefined) {
        queryParts.push(`patientId=${encodeURIComponent(params.patientId)}`);
      }

      return queryParts.length ? `?${queryParts.join('&')}` : '';
    },

    async findAvailableAppointments(params: { therapistId?: number | null; patientId?: number | null; timeOfDayId?: number | null; duration?: number | null }): Promise<SingleAppointment[]> {
      try {
        const queryParts: string[] = [];
        
        if (params.therapistId) {
          queryParts.push(`therapistId=${encodeURIComponent(params.therapistId)}`);
        }

        if (params.patientId) {
          queryParts.push(`patientId=${encodeURIComponent(params.patientId)}`);
        }
    
        if (params.timeOfDayId) {
          queryParts.push(`timeOfDayId=${encodeURIComponent(params.timeOfDayId)}`);
        }
    
        if (params.duration) {
          queryParts.push(`duration=${encodeURIComponent(params.duration)}`);
        }
    
        const queryString = queryParts.length ? `?${queryParts.join('&')}` : '';
        const responseData: JSONSingleAppointmentDTO[] = (await apiClient.get(`appointments/available${queryString}`)).data;
        return responseData.map(dto => convertToAppointment(dto));
      } catch (err) {
        console.error('Fehler beim Laden der verfügbaren Termine:', err);
        toast.error('Fehler beim Laden der verfügbaren Termine.');
        return [];
      }
    }
    
  },

  getters: {
    getAllAppointments: (state) => state.appointments,

    getAppointmentConflicts: (state) => state.appointmentConflicts,

    getAppointmentById: (state) => (id: number) => {
      return state.appointments.find(appointment => appointment.id === id);
    },

    getAppointmentsByPatientId: (state) => (patientId: number) => {
      return state.appointments.filter(appointment => appointment.patient.id === patientId) || [];
    },

    getAppointmentsByTherapistId: (state) => (therapistId: number) => {
      return state.appointments.filter(appointment => appointment.therapist.id === therapistId) || [];
    },

    getAppointmentsForTherapist: (state) => (therapistId: number, date: Date) => {
      return state.appointments.filter(
        appointment => appointment.therapistId === therapistId && appointment.date === date
      );
    },

    getAppointmentsForDate: (state) => (date: Date) => {
      const appointments = state.appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.date).toISOString().split('T')[0];
        const searchDate = date.toISOString().split('T')[0];
        const isSameDate = appointmentDate === searchDate;
        return isSameDate;
      });
      return appointments;
    },

    

    getAppointmentByTherapistAndTime: (state) => (therapistId: number, date: Date, time: Date) => {
      const appointments = state.appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.date).toISOString().split('T')[0];
        const searchDate = date.toISOString().split('T')[0];
        const isSameDate = appointmentDate === searchDate;

        const appointmentStartTime = new Date(appointment.startTime);
        const appointmentEndTime = new Date(appointment.endTime);
        const isInTimeRange = time >= appointmentStartTime && time <= appointmentEndTime;

        return therapistId === appointment.therapist.id && isInTimeRange && isSameDate;
      });
      return appointments.length > 0 ? appointments[0] : null;
    },
  },
});
