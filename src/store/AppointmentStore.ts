// src/stores/appointmentStore.ts
import { defineStore } from 'pinia';
import SingleAppointment from '@/class/SingleAppointment';
import { JSONSingleAppointmentDTO } from '@/class/JSONStructures';
import { convertToAppointment, convertToAppointmentDTO } from './convert';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import { useAuthStore } from './authStore';
import apiClient from './apiClient';

export const useAppointmentStore = defineStore('appointment', {
  state: () => ({
    appointments: [] as SingleAppointment[],
    appointmentConflicts: [] as SingleAppointment[],
  }),

  actions: {
    async loadAppointments(params?: { date?: string; therapistId?: number; patientId?: number }): Promise<void> {
      try {
        const queryString = params ? this.buildQueryString(params) : '';
        const responseData: JSONSingleAppointmentDTO[] = (await apiClient.get(`appointments${queryString}`)).data;
        this.appointments = responseData.map(dto => convertToAppointment(dto));
      } catch (err) {
        console.error(err);
        toast.error('Fehler beim Laden der Termine.');
      }
    },

    async loadAppointmentsForDate(date: string): Promise<void> {
      await this.loadAppointments({ date });
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
        this.loadAppointments({ date: appointment.date.toISOString() });
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
        this.loadAppointments();
        toast.success('Termin erfolgreich aktualisiert.');
      } catch (err) {
        console.error(err);
        toast.error('Fehler beim Aktualisieren des Termins.');
      }
    },

    async deleteAppointment(id: number): Promise<void> {
      try {
        await apiClient.delete(`appointments/${id}`);
        this.loadAppointments();
        toast.success('Termin erfolgreich gelöscht.');
      } catch (err) {
        console.error(err);
        toast.error('Fehler beim Löschen des Termins.');
      }
    },

    buildQueryString(params: { date?: string; therapistId?: number; patientId?: number }): string {
      const queryParts: string[] = [];

      if (params.date) {
        queryParts.push(`date=${encodeURIComponent(params.date)}`);
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
