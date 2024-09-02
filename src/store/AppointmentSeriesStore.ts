import { defineStore } from 'pinia';
import axios, { AxiosError } from 'axios';
import AppointmentSeries from '@/class/AppointmentSeries';
import { JSONAppointmentSeriesDTO } from '@/class/JSONStructures';
import { convertToAppointmentSeries, convertToAppointmentSeriesDTO } from './convert';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

export const useAppointmentSeriesStore = defineStore('appointmentSeries', {
  state: () => ({
    seriesAppointments: [] as AppointmentSeries[],
  }),

  actions: {
    async loadAppointmentSeries(params?: { date?: string; therapistId?: number; patientId?: number }): Promise<void> {
      try {
        const queryString = params ? this.buildQueryString(params) : '';
        const responseData: JSONAppointmentSeriesDTO[] = (await axios.get(`http://localhost:8080/api/appointmentseries${queryString}`)).data;
        this.seriesAppointments = responseData.map(dto => convertToAppointmentSeries(dto));
      } catch (err) {
        this.handleAxiosError(err, 'Fehler beim Laden der Serientermine.');
      }
    },

    async loadSeriesAppointmentsForDate(date: string): Promise<void> {
      await this.loadAppointmentSeries({ date });
    },

    async addAppointmentSeries(appointment: AppointmentSeries): Promise<void> {
      try {
        const appointmentDTO = convertToAppointmentSeriesDTO(appointment);
        const response = await axios.post('http://localhost:8080/api/appointmentseries', appointmentDTO);

          this.loadAppointmentSeries();
          toast.success('Serientermin erfolgreich erstellt.');

      } catch (err) {
        this.handleAxiosError(err, 'Fehler beim Erstellen des Serientermins.');
      }
    },

    async updateAppointmentSeries(id: number, appointment: AppointmentSeries): Promise<void> {
      try {
        const appointmentDTO = convertToAppointmentSeriesDTO(appointment);
        const response = await axios.put(`http://localhost:8080/api/appointmentseries/${id}`, appointmentDTO);

        if (response.status === 200) {
          this.loadAppointmentSeries({ date: appointment.startDate.toISOString().split('T')[0] });
          toast.success('Serientermin erfolgreich aktualisiert.');
        }
      } catch (err) {
        this.handleAxiosError(err, 'Fehler beim Aktualisieren des Serientermins.');
      }
    },

    async deleteAppointmentSeries(id: number): Promise<void> {
      try {
        const appointmentToDelete = this.getAppointmentSeriesById(id);
        if (!appointmentToDelete) {
          toast.error('Serientermin nicht gefunden.');
          return;
        }

        await axios.delete(`http://localhost:8080/api/appointmentseries/${id}`);
        this.loadAppointmentSeries({ date: appointmentToDelete.startDate.toISOString().split('T')[0] });
        toast.success('Serientermin erfolgreich gelöscht.');
      } catch (err) {
        this.handleAxiosError(err, 'Fehler beim Löschen des Serientermins.');
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

    handleAxiosError(err: any, defaultMessage: string) {
      if (err instanceof AxiosError) {
        console.error(err);
        if (err.response) {
          switch (err.response.status) {
            case 409:
              toast.error(`Konflikt: ${err.response.data}`);
              break;
            case 400:
              toast.error(`Ungültige Anfrage: ${err.response.data}`);
              break;
            case 404:
              toast.error('Ressource nicht gefunden.');
              break;
            default:
              toast.error(defaultMessage);
              break;
          }
        } else {
          toast.error(defaultMessage);
        }
      } else {
        toast.error('Unbekannter Fehler.');
      }
    },
  },

  getters: {
    getAllAppointmentSeries: (state) => state.seriesAppointments,

    getAppointmentSeriesById: (state) => (id: number) => {
      return state.seriesAppointments.find(appointment => appointment.id === id);
    },

    getAppointmentSeriesByPatientId: (state) => (patientId: number) => {
      return state.seriesAppointments.filter(appointment => appointment.patient.id === patientId) || [];
    },

    getAppointmentSeriesByTherapistId: (state) => (therapistId: number) => {
      return state.seriesAppointments.filter(appointment => appointment.therapist.id === therapistId) || [];
    },

    getAppointmentSeriesForTherapistAndDate: (state) => (therapistId: number, date: string) => {
      return state.seriesAppointments.filter(
        appointment => appointment.therapistId === therapistId && appointment.startDate.toISOString().split('T')[0] <= date && appointment.endDate.toISOString().split('T')[0] >= date
      );
    },

    getAppointmentSeriesByTherapistAndTime: (state) => (therapistId: number, date: Date, time: Date) => {
      return state.seriesAppointments.find(
        appointment => appointment.therapistId === therapistId && appointment.startDate.toISOString().split('T')[0] === date.toISOString().split('T')[0] && appointment.startTime.toISOString().split('T')[1] === time.toISOString().split('T')[1]
      );
    },
  },
});
