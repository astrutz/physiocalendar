import { defineStore } from 'pinia';
import axios, { AxiosError } from 'axios';
import SingleAppointment from '@/class/SingleAppointment';
import { JSONSingleAppointmentDTO } from '@/class/JSONStructures';
import { convertToAppointment, convertToAppointmentDTO } from './convert';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

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
        console.log(this.appointments);
      } catch (err) {
        console.error(err);
        toast.error('Fehler beim Laden der Termine.');
        
      }
    },

    async loadAppointmentsForDate(date: string): Promise<void> {
      await this.loadAppointments({ date });
    },

    async addAppointment(appointment: SingleAppointment): Promise<void> {
      try {
        const appointmentDTO = convertToAppointmentDTO(appointment);
        const response = await axios.post('http://localhost:8080/api/appointments', appointmentDTO);

          this.loadAppointments({ date: appointment.date.toISOString() });
          toast.success("Termin erfolgreich erstellt.");
      } catch (err) {
        if (err instanceof AxiosError) {
          console.error(err);
          if (err.response) {
            switch (err.response.status) {
              case 409:
                toast.error(`Konflikt beim Erstellen des Termins: ${err.response.data}`);
                break;
              case 400:
                toast.error(`Ungültige Anfrage: ${err.response.data}`);
                break;
              case 404:
                toast.error('Ressource nicht gefunden.');
                break;
              default:
                toast.error('Fehler beim Erstellen des Termins.');
                break;
            }
          } else {
            toast.error('Fehler beim Erstellen des Termins.');
          }
        } else {
          toast.error('Unbekannter Fehler beim Erstellen des Termins.');
        }
      }
    },

    async updateAppointment(id: number, appointment: SingleAppointment): Promise<void> {
      try {
        const appointmentDTO = convertToAppointmentDTO(appointment);
        const response = await axios.put(`http://localhost:8080/api/appointments/${id}`, appointmentDTO);

        if (response.status === 200) {
          this.loadAppointments({ date: appointment.date.toISOString() });
          toast.success('Termin erfolgreich aktualisiert.');
        }
      } catch (err) {
        if (err instanceof AxiosError) {
          console.error(err);
          if (err.response) {
            switch (err.response.status) {
              case 409:
                toast.error(`Konflikt beim Aktualisieren des Termins: ${err.response.data}`);
                break;
              case 400:
                toast.error(`Ungültige Anfrage: ${err.response.data}`);
                break;
              case 404:
                toast.error('Ressource nicht gefunden.');
                break;
              default:
                toast.error('Fehler beim Aktualisieren des Termins.');
                break;
            }
          } else {
            toast.error('Fehler beim Aktualisieren des Termins.');
          }
        } else {
          toast.error('Unbekannter Fehler beim Aktualisieren des Termins.');
        }
      }
    },

    async deleteAppointment(id: number): Promise<void> {
      try {
        await axios.delete(`http://localhost:8080/api/appointments/${id}`);
        this.loadAppointments();
        toast.success('Termin erfolgreich gelöscht.');
      } catch (err) {
        if (err instanceof AxiosError) {
          console.error(err);
          toast.error(err.response?.data?.message || 'Fehler beim Löschen des Termins.');
        } else {
          toast.error('Unbekannter Fehler beim Löschen des Termins.');
        }
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

    getAppointmentByTherapistAndTime: (state) => (therapistId: number, date: Date, time: Date) => {
      return state.appointments.find(
        appointment => appointment.therapistId === therapistId && appointment.date === date && appointment.startTime === time
      );
    },
  },
});
