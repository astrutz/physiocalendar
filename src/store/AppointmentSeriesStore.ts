import { defineStore } from 'pinia';
import axios from 'axios';
import AppointmentSeries from '@/class/AppointmentSeries';
import { JSONAppointmentSeriesDTO } from '@/class/JSONStructures';
import { convertToAppointmentSeries, convertToAppointmentSeriesDTO } from './convert';

export const useAppointmentSeriesStore = defineStore('appointmentSeries', {
  state: () => ({
    seriesAppointments: [] as AppointmentSeries[],
  }),

  actions: {
    async loadAppointmentSeries(params?: { date?: string; therapistId?: number; patientId?: number }): Promise<void> {
      try {
        const queryString = params ? this.buildQueryString(params) : '';
        const responseData: JSONAppointmentSeriesDTO[] = (await axios.get(`http://localhost:8080/api/seriesAppointments${queryString}`)).data;
        this.seriesAppointments = responseData.map(dto => convertToAppointmentSeries(dto));
      } catch (err) {
        console.error(err);
      }
    },

    async loadSeriesAppointmentsForDate(date: string): Promise<void> {
      await this.loadAppointmentSeries({ date });
    },

    async addAppointmentSeries(appointment: AppointmentSeries): Promise<void> {
      try {
        const appointmentDTO = convertToAppointmentSeriesDTO(appointment);
        await axios.post('http://localhost:8080/api/seriesAppointments', appointmentDTO);
        this.loadAppointmentSeries({ date: appointment.startDate.toISOString().split('T')[0] });
      } catch (err) {
        console.error(err);
      }
    },

    async updateAppointmentSeries(id: number, appointment: AppointmentSeries): Promise<void> {
      try {
        const appointmentDTO = convertToAppointmentSeriesDTO(appointment);
        await axios.put(`http://localhost:8080/api/seriesAppointments/${id}`, appointmentDTO);
        this.loadAppointmentSeries({ date: appointment.startDate.toISOString().split('T')[0] });
      } catch (err) {
        console.error(err);
      }
    },

    async deleteAppointmentSeries(id: number): Promise<void> {
      try {
        const appointmentToDelete = this.getAppointmentSeriesById(id);
        await axios.delete(`http://localhost:8080/api/seriesAppointments/${id}`);
        this.loadAppointmentSeries({ date: appointmentToDelete?.startDate.toISOString().split('T')[0] });
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
    getAllAppointmentSeries: (state) => state.seriesAppointments,

    getAppointmentSeriesById: (state) => (id: number) => {
      return state.seriesAppointments.find(appointment => appointment.id === id);
    },

    getAppointmentSeriesForPatient: (state) => (patientId: number) => {
      return state.seriesAppointments.filter(appointment => appointment.patientId === patientId);
    },

    getAppointmentSeriesForTherapist: (state) => (therapistId: number, date: string) => {
      return state.seriesAppointments.filter(
        appointment => appointment.therapistId === therapistId && appointment.startDate.toISOString().split('T')[0] <= date && appointment.endDate.toISOString().split('T')[0] >= date
      );
    },

    getAppointmentSeriesByTherapistAndTime: (state) => (therapistId: number, date: Date, time: Date) => {
      return state.seriesAppointments.find(
        appointment => appointment.therapistId === therapistId && appointment.startTime === time
      );
    },
  },
});
