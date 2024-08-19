import { defineStore } from 'pinia';
import axios from 'axios';
import SingleAppointment from '@/class/SingleAppointment';
import { JSONSingleAppointmentDTO } from '@/class/JSONStructures';
import { convertToAppointment, convertToAppointmentDTO } from './convert';

export const useAppointmentStore = defineStore('appointment', {
  state: () => ({
    appointments: [] as SingleAppointment[],
  }),

  actions: {
    async loadAppointments(params?: { date?: string; therapistId?: number; patientId?: number }): Promise<void> {
      try {
        const queryString = params ? this.buildQueryString(params) : '';
        const responseData: JSONSingleAppointmentDTO[] = (await axios.get(`http://localhost:8080/api/appointments${queryString}`)).data;
        this.appointments = responseData.map(dto => convertToAppointment(dto));
      } catch (err) {
        console.error(err);
      }
    },

    async loadAppointmentsForDate(date: string): Promise<void> {
      await this.loadAppointments({ date });
    },

    async addAppointment(appointment: SingleAppointment): Promise<void> {
      try {
        const appointmentDTO = convertToAppointmentDTO(appointment);
        await axios.post('http://localhost:8080/api/appointments', appointmentDTO);
        this.loadAppointments({ date: appointment.date.toISOString() });
      } catch (err) {
        console.error(err);
      }
    },

    async updateAppointment(id: number, appointment: SingleAppointment): Promise<void> {
      try {
        const appointmentDTO = convertToAppointmentDTO(appointment);
        await axios.put(`http://localhost:8080/api/appointments/${id}`, appointmentDTO);
        this.loadAppointments({ date: appointment.date.toISOString() });
      } catch (err) {
        console.error(err);
      }
    },

    async deleteAppointment(id: number): Promise<void> {
      try {
        const appointmentToDelete = this.getAppointmentById(id);
        await axios.delete(`http://localhost:8080/api/appointments/${id}`);
        this.loadAppointments({ date: appointmentToDelete?.date.toISOString() });
      } catch (err) {
        console.error(err);
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
  },

  getters: {
    getAllAppointments: (state) => state.appointments,

    getAppointmentById: (state) => (id: number) => {
      return state.appointments.find(appointment => appointment.id === id);
    },

    getAppointmentsByPatientId: (state) => (patientId: number) => {
      console.log(state.appointments);
      return state.appointments.filter(appointment => appointment.patient.id === patientId) || [];
    },
    

    getAppointmentsForTherapist: (state) => (therapistId: number, date: Date) => {
      return state.appointments.filter(
        appointment => appointment.therapistId === therapistId && appointment.date === date
      );
    },

    getAppointmentByTherapistAndTime: (state) => (therapistId: number, date: Date, time: Date) => {
      return state.appointments.find(
        appointment => appointment.therapistId === therapistId && appointment.date === date && appointment.startTime === time
      );
    },
  },
});
